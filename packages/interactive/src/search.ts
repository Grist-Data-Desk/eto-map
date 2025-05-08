import {
  hideSuggestions,
  processSelectedLocation,
  suggestionIndex,
  highlightSuggestion,
} from "./suggestions";

import * as d3 from "d3";

import { suggestLocations } from "./suggestions";
import type { Warehouse } from "./types";
import { removeUserMarker } from "./marker";
import { queryNominatim } from "./nominatim";
import { debounce } from "lodash-es";

interface InitSearchParams {
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  warehouses: Warehouse[];
}

/**
 * Initialize the search functionality.
 *
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 * @param warehouses - The warehouse data.
 */
export function initSearch({
  svg,
  g,
  zoom,
  warehouses,
}: InitSearchParams): void {
  const searchInput = d3.select<HTMLInputElement, unknown>("#search-input");
  const searchButton = d3.select<HTMLButtonElement, unknown>("#search-button");
  const suggestionsList = d3.select<HTMLUListElement, unknown>(
    "#search-suggestions"
  );

  // Suggest locations as the user types.
  searchInput.on(
    "input",
    debounce((event: KeyboardEvent & { target: HTMLInputElement }) => {
      const query = event.target.value.trim();

      suggestLocations({ query, svg, g, zoom, warehouses, suggestionsList });
    }, 400)
  );

  // Trigger search when the user presses Enter.
  searchInput.on("keydown", (event) => {
    switch (event.key) {
      case "Enter": {
        event.preventDefault();

        handleSearch({
          query: searchInput.property("value").trim(),
          svg,
          g,
          zoom,
          warehouses,
        });
        break;
      }
      case "ArrowDown": {
        event.preventDefault();

        suggestionIndex.value = Math.min(
          suggestionIndex.value + 1,
          suggestionsList.selectAll("li").size() - 1
        );
        highlightSuggestion(
          suggestionIndex.value,
          searchInput,
          suggestionsList
        );

        break;
      }
      case "ArrowUp": {
        event.preventDefault();

        suggestionIndex.value = Math.max(suggestionIndex.value - 1, -1);
        highlightSuggestion(
          suggestionIndex.value,
          searchInput,
          suggestionsList
        );

        break;
      }
    }
  });

  searchButton.on("click", () =>
    handleSearch({
      query: searchInput.property("value").trim(),
      svg,
      g,
      zoom,
      warehouses,
    })
  );

  // Hide suggestions when the user clicks outside the search input or
  // suggestions list.
  d3.select(document).on("click", (event) => {
    const target = event.target;

    const isInput = target === searchInput.node();
    const isSuggestion = (
      suggestionsList?.node() as HTMLUListElement | null
    )?.contains(target);

    if (!isInput && !isSuggestion) {
      hideSuggestions();
    }
  });
}

interface HandleSearchParams {
  query: string;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  warehouses: Warehouse[];
}

/**
 * Handle the search functionality.
 *
 * @param query - The search query.
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 * @param warehouses - The warehouse data.
 */
async function handleSearch({
  query,
  svg,
  g,
  zoom,
  warehouses,
}: HandleSearchParams): Promise<void> {
  // Hide any existing suggestions.
  hideSuggestions();

  const searchResults = d3.select("#search-results");

  if (query.length === 0) {
    searchResults.text("Introduzca una dirección o código postal.");
    return;
  }

  searchResults.text("Buscando...");
  removeUserMarker();

  const results = await queryNominatim(query, 1);

  if (results.length > 0) {
    processSelectedLocation({ hit: results[0], svg, g, zoom, warehouses });
  } else {
    searchResults.text(
      "La dirección no fue encontrada. Por favor, intente una búsqueda diferente."
    );
  }
}
