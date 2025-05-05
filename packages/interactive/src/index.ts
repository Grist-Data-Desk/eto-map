import * as d3 from "d3";

import { HEIGHT, WIDTH } from "./constants";
import { loadData } from "./data";
import { drawMap } from "./map";
import { initReset } from "./reset";
import { initSearch } from "./search";
import { checkDotHit } from "./tooltip";
import { initZoom } from "./zoom";

import "./index.css";

/**
 * Initialize the interactive.
 */
async function init() {
  // Add event listeners to check if the user touched or clicked on a dot.
  // If not, ensure the tooltip is hidden.
  document.addEventListener("touchstart", checkDotHit);
  document.addEventListener("click", checkDotHit);

  // Create SVG elements for the map.
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("max-width", "100%")
    .style("height", "auto");

  const prSvg = d3
    .select(".eto-national-map__puerto-rico-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 150 100")
    .attr("preserveAspectRatio", "xMidYMid meet");

  const tooltip = d3.select<HTMLDivElement, unknown>("#tooltip");
  const g = svg.append("g");

  try {
    // Load the data.
    const { warehouses, us } = await loadData();
    d3.select(".eto-national-map__loading").remove();

    // Draw the map.
    drawMap({ prSvg, g, tooltip, warehouses, us });

    // Initialize the zoom.
    const zoom = initZoom(svg, g);

    // Initialize the search.
    initSearch({ svg, g, zoom, warehouses });

    // Initialize the reset.
    initReset(svg, g, zoom);
  } catch (error) {
    d3.select(".eto-national-map__loading").text(
      "Error encountered initializing the map. Please try again later."
    );
    console.error("Error during initialization: ", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
