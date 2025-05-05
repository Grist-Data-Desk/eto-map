import * as d3 from "d3";

import {
  BASE_DOT_RADIUS,
  BASE_STROKE_WIDTH,
  USER_LOCATION_DOT_RADIUS,
} from "./constants";

interface ZoomedParams {
  event: d3.D3ZoomEvent<SVGSVGElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  stateBorders: d3.Selection<SVGPathElement, unknown, SVGGElement, unknown>;
  countryOutline: d3.Selection<SVGPathElement, unknown, SVGGElement, unknown>;
  mainlandDots: d3.Selection<SVGCircleElement, unknown, SVGGElement, unknown>;
  highlightedDots: d3.Selection<
    SVGCircleElement,
    unknown,
    SVGGElement,
    unknown
  >;
}

/**
 * Handle the zoom event. This scales the state borders and country outline
 * while the user pans and zooms the map.
 *
 * @param event - The zoom event.
 * @param g - The SVG group element containing warehouse dots.
 * @param stateBorders - The SVG path elements representing state borders.
 * @param countryOutline - The SVG path elements representing the country outline.
 * @param mainlandDots - The SVG circles representing mainland warehouse dots.
 * @param highlightedDots - The SVG circles representing highlighted warehouse dots.
 */
function zoomed({
  event,
  g,
  stateBorders,
  countryOutline,
  mainlandDots,
  highlightedDots,
}: ZoomedParams): void {
  const { transform } = event;

  g.attr("transform", transform.toString());

  stateBorders.attr("stroke-width", BASE_STROKE_WIDTH / transform.k);
  countryOutline.attr("stroke-width", BASE_STROKE_WIDTH / transform.k);

  mainlandDots
    .attr("r", BASE_DOT_RADIUS / transform.k)
    .attr("stroke-width", BASE_STROKE_WIDTH / transform.k);

  highlightedDots
    .attr("r", (BASE_DOT_RADIUS * 1.5) / transform.k)
    .attr("stroke-width", 2 / transform.k);

  g.select<SVGCircleElement>("#user-location-marker")
    .attr("r", USER_LOCATION_DOT_RADIUS / transform.k)
    .attr("stroke-width", 1.5 / transform.k);
}

/**
 * Initialize the zoom behavior.
 *
 * @param svg - The SVG element containing the map.
 * @param g - The SVG group element containing warehouse dots.
 * @returns – The zoom behavior.
 */
export function initZoom(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>
): d3.ZoomBehavior<SVGSVGElement, unknown> {
  const stateBorders = g.selectAll<SVGPathElement, unknown>(
    ".eto-national-map__state-borders"
  );
  const countryOutline = g.selectAll<SVGPathElement, unknown>(
    ".eto-national-map__country-outline"
  );
  const mainlandDots = g.selectAll<SVGCircleElement, unknown>(
    ".eto-national-map__location-dot.mainland"
  );
  const highlightedDots = g.selectAll<SVGCircleElement, unknown>(
    ".eto-national-map__location-dot.highlighted"
  );

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 8])
    .on("zoom", (event) =>
      zoomed({
        event,
        g,
        stateBorders,
        countryOutline,
        mainlandDots,
        highlightedDots,
      })
    );

  svg.call(zoom);

  d3.select("#zoom-in").on("click", function () {
    svg.transition().duration(300).call(zoom.scaleBy, 1.3);
  });

  d3.select("#zoom-out").on("click", function () {
    svg
      .transition()
      .duration(300)
      .call(zoom.scaleBy, 1 / 1.3);
  });

  return zoom;
}
