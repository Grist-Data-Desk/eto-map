import * as d3 from "d3";

import { BASE_STROKE_WIDTH, BASE_DOT_RADIUS } from "./constants";
import { removeUserMarker } from "./marker";
import { hideSuggestions } from "./suggestions";

/**
 * Reset the map to its default state.
 *
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 */
function resetMap(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
) {
  svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);

  const searchInput = d3.select("#search-input");
  const searchResults = d3.select("#search-results");
  searchInput.property("value", "");
  searchResults.text("");

  hideSuggestions();
  removeUserMarker();

  g.selectAll(".eto-national-map__location-dot.highlighted")
    .classed("highlighted", false)
    .transition()
    .duration(100)
    .attr("stroke", "white")
    .attr("r", BASE_DOT_RADIUS / (d3.zoomTransform(svg.node()!).k || 1))
    .attr(
      "stroke-width",
      BASE_STROKE_WIDTH / (d3.zoomTransform(svg.node()!).k || 1)
    );
}

/**
 * Initialize the reset event listener.
 *
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @param zoom - The zoom behavior.
 */
export function initReset(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
) {
  d3.select("#reset-view").on("click", () => resetMap(svg, g, zoom));
}
