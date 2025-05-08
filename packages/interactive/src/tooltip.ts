import * as d3 from "d3";

import type { Warehouse } from "./types";
import { isTabletOrAbove } from "./utils";

/**
 * Check if the user touched or clicked on a dot. If not, hide the tooltip.
 *
 * @param event - The touch or click event.
 */
export function checkDotHit(event: TouchEvent | MouseEvent): void {
  const tooltip = document.getElementById("tooltip");
  const target = event.target as HTMLElement | SVGElement;

  if (
    !target?.classList.contains("eto-national-map__location-dot") &&
    tooltip
  ) {
    hideTooltip();
  }
}

/**
 * Show the tooltip.
 *
 * @param event - The MouseEvent for the hovered or tapped dot.
 * @param d - The data of the hovered or tapped warehouse.
 */
export function showTooltip(event: MouseEvent, d: Warehouse): void {
  const tooltip = d3.select("#tooltip");
  const mapContainer = document
    .querySelector(".eto-national-map__container")!
    .getBoundingClientRect();

  const tabletOrAbove = isTabletOrAbove();

  const tooltipWidth = tabletOrAbove ? 250 : 260;
  const tooltipHeight = tabletOrAbove ? 100 : 120;
  const tooltipOffset = 15;

  const mouseX = event.clientX - mapContainer.left;
  const mouseY = event.clientY - mapContainer.top;

  let tooltipX = mouseX + tooltipOffset;
  let tooltipY = mouseY + tooltipOffset;

  if (tooltipX + tooltipWidth > mapContainer.width) {
    tooltipX = mouseX - tooltipWidth - tooltipOffset;
  }

  if (tooltipY + tooltipHeight > mapContainer.height) {
    tooltipY = mouseY - tooltipHeight - tooltipOffset;
  }

  tooltipX = Math.max(
    10,
    Math.min(mapContainer.width - tooltipWidth - 10, tooltipX)
  );
  tooltipY = Math.max(
    10,
    Math.min(mapContainer.height - tooltipHeight - 10, tooltipY)
  );

  const tooltipContent = `
        <h3>${d.company}</h3>
        <p><strong>Dirección:</strong> ${d.address}</p>
        <p><strong>Estado:</strong> ${d.state}</p>
        <p><strong>Estatus:</strong> ${d.type === "Confirmed" ? "Confirmado" : "Potencial"}</p>
        `;

  tooltip
    .style("left", `${tooltipX}px`)
    .style("top", `${tooltipY}px`)
    .html(tooltipContent)
    .classed("visible", true)
    .style("opacity", 1);
}

/**
 * Hide the tooltip.
 */
export function hideTooltip(): void {
  const tooltip = d3.select("#tooltip");

  tooltip.classed("visible", false).style("opacity", 0);
}
