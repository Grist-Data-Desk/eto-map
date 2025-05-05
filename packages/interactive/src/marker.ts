import * as d3 from "d3";

import { PROJECTION, USER_LOCATION_DOT_RADIUS } from "./constants";

/**
 * Remove the user marker from the map.
 */
export function removeUserMarker() {
  d3.select("#user-location-marker").remove();
}

interface AddUserMarkerParams {
  latitude: number;
  longitude: number;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
}

/**
 * Add the user marker to the map at the specified latitude and longitude.
 */
export function addUserMarker({
  latitude,
  longitude,
  svg,
  g,
}: AddUserMarkerParams) {
  const currentScale = d3.zoomTransform(svg.node()!).k || 1;
  const coords = PROJECTION([longitude, latitude]);

  if (coords) {
    g.append("circle")
      .attr("id", "user-location-marker")
      .attr("cx", coords[0])
      .attr("cy", coords[1])
      .attr("r", USER_LOCATION_DOT_RADIUS / currentScale)
      .attr("fill", "var(--color-user-location)")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5 / currentScale)
      .style("opacity", 0.9)
      .style("pointer-events", "none");
  }
}
