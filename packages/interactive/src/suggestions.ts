import * as d3 from "d3";

import { WIDTH, HEIGHT, PROJECTION, BASE_DOT_RADIUS } from "./constants";
import { addUserMarker, removeUserMarker } from "./marker";
import { findNearestWarehouse } from "./location";
import { queryNominatim } from "./nominatim";
import { Warehouse, NominatimHit } from "./types";

/**
 * The index of the currently highlighted suggestion.
 */
export const suggestionIndex = { value: -1 };

interface SuggestLocationsParams {
  query: string;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  suggestionsList: d3.Selection<
    HTMLUListElement,
    unknown,
    HTMLElement,
    unknown
  >;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  warehouses: Warehouse[];
}

/**
 * Fetch and display location suggestions using the OpenStreetMap Nominatim API.
 *
 * @param query - The search query.
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 * @param warehouses - The warehouse data.
 */
export async function suggestLocations({
  query,
  svg,
  g,
  zoom,
  warehouses,
}: SuggestLocationsParams): Promise<void> {
  if (query.length < 3) {
    hideSuggestions();
    return;
  }

  const suggestions = await queryNominatim(query);

  if (suggestions.length > 0) {
    displaySuggestions({
      suggestions,
      svg,
      g,
      zoom,
      warehouses,
    });
  } else {
    hideSuggestions();
  }
}

interface DisplaySuggestionsParams {
  suggestions: NominatimHit[];
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  warehouses: Warehouse[];
}

/**
 * Display the suggestions list.
 *
 * @param suggestions - The suggestions to display.
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 * @param warehouses - The warehouse data.
 */
function displaySuggestions({
  suggestions,
  svg,
  g,
  zoom,
  warehouses,
}: DisplaySuggestionsParams): void {
  const suggestionsList = d3.select("#search-suggestions");
  suggestionsList.html("");

  suggestions.forEach((suggestion, index) => {
    suggestionsList
      .append("li")
      .attr("class", "eto-national-map__suggestions-item")
      .text(suggestion.display_name)
      .on("click", () => {
        selectSuggestion({
          suggestions,
          index,
          svg,
          g,
          zoom,
          warehouses,
        });
      });
  });
  suggestionsList.classed("visible", true);

  const searchInput = d3.select("#search-input");
  searchInput.classed(
    "eto-national-map__search-input--suggestions-visible",
    true
  );
}

/**
 * Hide the suggestions list.
 */
export function hideSuggestions(): void {
  suggestionIndex.value = -1;

  const suggestionsList = d3.select("#search-suggestions");
  suggestionsList.classed("visible", false);

  const searchInput = d3.select("#search-input");
  searchInput.classed(
    "eto-national-map__search-input--suggestions-visible",
    false
  );
}

interface SelectSuggestionParams {
  suggestions: NominatimHit[];
  index: number;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  warehouses: Warehouse[];
}

/**
 * Select a suggestion.
 *
 * @param suggestions - The suggestions to display.
 * @param index - The index of the suggestion to select.
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 * @param warehouses - The warehouse data.
 */
function selectSuggestion({
  suggestions,
  index,
  svg,
  g,
  zoom,
  warehouses,
}: SelectSuggestionParams): void {
  const searchInput = d3.select("#search-input");
  const searchResults = d3.select("#search-results");

  const selected = suggestions[index];
  searchInput.property("value", selected.display_name);
  hideSuggestions();

  searchResults.text("Processing selected location...");
  processSelectedLocation({ hit: selected, svg, g, zoom, warehouses });
}

interface ProcessSelectedLocationParams {
  hit: NominatimHit;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  warehouses: Warehouse[];
}

/**
 * Process the selected location.
 *
 * @param hit - The hit to process.
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 * @param warehouses - The warehouse data.
 */
export function processSelectedLocation({
  hit,
  svg,
  g,
  zoom,
  warehouses,
}: ProcessSelectedLocationParams): void {
  const { lat, lon, display_name: displayName } = hit;
  const userLocation = { longitude: lon, latitude: lat };

  const searchInput = d3.select("#search-input");
  const searchResults = d3.select("#search-results");

  searchInput.property("value", displayName);

  removeUserMarker();
  addUserMarker({ latitude: lat, longitude: lon, svg, g });

  const coords = PROJECTION([lon, lat]);
  let mapPanningMessage = "";

  if (coords) {
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(WIDTH / 2, HEIGHT / 2)
          .scale(4)
          .translate(-coords[0], -coords[1])
      );
  } else {
    mapPanningMessage = "(Map panning only available for mainland US)";
  }

  const nearest = findNearestWarehouse(userLocation, warehouses);
  const locationSpan = `<span style="font-style: normal;">📍</span>&emsp;`;
  const warehouseSpan = `<span style="font-style: normal;">🚚</span>&emsp;`;

  const warehouseType =
    nearest.warehouse.type.toLowerCase() === "confirmed"
      ? "confirmado"
      : "potencial";
  const warehouseName = nearest.warehouse.company;
  const warehouseText = `<strong>Almacén ${warehouseType} más cercano:</strong> ${warehouseName} (${nearest.distance.toFixed(
    1
  )} millas de distancia)`;

  highlightWarehouse(nearest.warehouse, svg, g);

  const locationString = `${locationSpan}<strong>Ubicación buscada:</strong> ${displayName}${mapPanningMessage}`;
  const finalHtml = `${locationString}<br />${warehouseSpan}${warehouseText}`;
  searchResults.html(finalHtml);
}

/**
 * Highlight a warehouse.
 *
 * @param warehouse - The warehouse to highlight.
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 */
function highlightWarehouse(
  warehouse: Warehouse,
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>
): void {
  g.selectAll(".eto-national-map__location-dot.highlighted")
    .classed("highlighted", false)
    .transition()
    .duration(100)
    .attr("stroke", "white");

  const dot = g
    .selectAll<
      SVGCircleElement,
      Warehouse
    >(".eto-national-map__location-dot.mainland")
    .filter(
      (d) => d.company === warehouse.company && d.address === warehouse.address
    );

  if (!dot.empty()) {
    const currentScale = d3.zoomTransform(svg.node()!).k || 1;

    dot
      .raise()
      .classed("highlighted", true)
      .transition()
      .duration(100)
      .attr("r", (BASE_DOT_RADIUS * 1.5) / currentScale)
      .attr("stroke", "var(--color-user-location)")
      .attr("stroke-width", 2 / currentScale);
  }
}

/**
 * Highlight a suggestion.
 *
 * @param index - The index of the suggestion to highlight.
 * @param searchInput - The search input element.
 * @param suggestionsList - The suggestions list element.
 */
export function highlightSuggestion(
  index: number,
  searchInput: d3.Selection<HTMLInputElement, unknown, HTMLElement, unknown>,
  suggestionsList: d3.Selection<HTMLUListElement, unknown, HTMLElement, unknown>
): void {
  const value = suggestionsList
    .selectAll("li")
    .filter((_, i) => i === index)
    .classed("active", true)
    .text();

  suggestionsList
    .selectAll("li")
    .filter((_, i) => i !== index)
    .classed("active", false);

  searchInput.property("value", value);
}
