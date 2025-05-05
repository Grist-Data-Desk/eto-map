import * as d3 from "d3";
import { partition } from "lodash-es";
import * as topojson from "topojson-client";

import {
  BASE_DOT_RADIUS,
  BASE_STROKE_WIDTH,
  PR_BASE_DOT_RADIUS,
  PROJECTION,
  PR_PROJECTION,
} from "./constants";
import { showTooltip, hideTooltip } from "./tooltip";
import type { UsAtlas, Warehouse } from "./types";

interface DrawMapParams {
  prSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>;
  warehouses: Warehouse[];
  us: UsAtlas;
}

export async function drawMap({
  prSvg,
  g,
  tooltip,
  warehouses,
  us,
}: DrawMapParams) {
  const path = d3.geoPath().projection(PROJECTION);

  // US states.
  g.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .join("path")
    .attr("class", "eto-national-map__state")
    .attr("d", path);

  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("class", "eto-national-map__state-borders")
    .attr("d", path);

  // US outline.
  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a === b))
    .attr("class", "eto-national-map__country-outline")
    .attr("d", path);

  // Puerto Rico.
  const puertoRico = us.objects.states.geometries.find((d) => d.id === "72")!;
  const prFeature = topojson.feature(us, {
    type: "GeometryCollection",
    geometries: [puertoRico],
  });
  const prPath = d3.geoPath().projection(PR_PROJECTION);

  prSvg
    .append("g")
    .selectAll("path")
    .data(prFeature.features)
    .enter()
    .append("path")
    .attr("class", "eto-national-map__state")
    .attr("d", prPath);

  prSvg
    .append("path")
    .datum(prFeature)
    .attr("class", "eto-national-map__country-outline")
    .attr("d", prPath);

  prSvg
    .append("text")
    .attr("class", "eto-national-map__pr-label")
    .attr("x", 75)
    .attr("y", 51)
    .text("Puerto Rico");

  // Partition the warehouse data into mainland and Puerto Rico.
  const [mainlandPoints, puertoRicoPoints] = partition<Warehouse>(
    warehouses,
    (d) => !(d.state === "PR" || d.state === "Puerto Rico")
  );

  // Draw the mainland dots.
  g.selectAll(".eto-national-map__location-dot.mainland")
    .data(mainlandPoints)
    .enter()
    .append("circle")
    .attr(
      "class",
      (d) =>
        `eto-national-map__location-dot mainland ${
          d.type.toLowerCase() === "confirmed" ? "confirmed" : "potential"
        }`
    )
    .attr("cx", (d) => {
      const coords = PROJECTION([d.longitude, d.latitude]);
      return coords ? coords[0] : null;
    })
    .attr("cy", (d) => {
      const coords = PROJECTION([d.longitude, d.latitude]);
      return coords ? coords[1] : null;
    })
    .attr("r", BASE_DOT_RADIUS)
    .attr("stroke-width", BASE_STROKE_WIDTH)
    .style("opacity", 0.8)
    .on("mouseover", function (event, d) {
      const currentScale = d3.zoomTransform(this).k || 1;
      showTooltip(event, d);

      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", (BASE_DOT_RADIUS * 1.3) / currentScale)
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      const currentScale = d3.zoomTransform(this).k || 1;

      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", BASE_DOT_RADIUS / currentScale)
        .style("opacity", 0.8);

      hideTooltip();
    })
    .on(
      "touchstart",
      function (event, d) {
        event.preventDefault();
        const wasVisible = tooltip.classed("visible");
        hideTooltip();

        const currentScale = d3.zoomTransform(this).k || 1;
        d3.select(this)
          .attr(
            "r",
            wasVisible
              ? BASE_DOT_RADIUS / currentScale
              : (BASE_DOT_RADIUS * 1.3) / currentScale
          )
          .style("opacity", wasVisible ? 0.8 : 1);

        if (!wasVisible) {
          showTooltip(event.touches[0], d);
        } else {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("r", BASE_DOT_RADIUS / currentScale)
            .style("opacity", 0.8);
        }
      },
      { passive: false }
    );

  // Draw the Puerto Rico dots.
  prSvg
    .selectAll(".eto-national-map__location-dot.puerto-rico")
    .data(puertoRicoPoints)
    .enter()
    .append("circle")
    .attr(
      "class",
      (d) =>
        `eto-national-map__location-dot puerto-rico ${
          d.type.toLowerCase() === "confirmed" ? "confirmed" : "potential"
        }`
    )
    .attr("cx", (d) => {
      const coords = PR_PROJECTION([d.longitude, d.latitude]);
      return coords ? coords[0] : null;
    })
    .attr("cy", (d) => {
      const coords = PR_PROJECTION([d.longitude, d.latitude]);
      return coords ? coords[1] : null;
    })
    .attr("r", PR_BASE_DOT_RADIUS)
    .style("opacity", 0.8)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", PR_BASE_DOT_RADIUS * 1.3)
        .style("opacity", 1);

      const rect = prSvg.node()!.getBoundingClientRect();
      const evt = {
        ...event,
        clientX: rect.left + parseFloat(d3.select(this).attr("cx")),
        clientY: rect.top + parseFloat(d3.select(this).attr("cy")),
      };

      showTooltip(evt, d);
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", PR_BASE_DOT_RADIUS)
        .style("opacity", 0.8);
      hideTooltip();
    })
    .on(
      "touchstart",
      function (event, d) {
        event.preventDefault();
        const wasVisible = tooltip.classed("visible");
        hideTooltip();

        if (!wasVisible) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("r", PR_BASE_DOT_RADIUS * 1.3)
            .style("opacity", 1);

          const rect = prSvg.node()!.getBoundingClientRect();
          const evt = {
            ...event,
            clientX: rect.left + parseFloat(d3.select(this).attr("cx")),
            clientY: rect.top + parseFloat(d3.select(this).attr("cy")),
          };

          showTooltip(evt, d);
        }
      },
      { passive: false }
    );
}
