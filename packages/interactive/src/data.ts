import * as d3 from "d3";

import US_ATLAS from "./data/us.json";
import { UsAtlas, Warehouse } from "./types";

/**
 * Fetch warehouse data from GitHub.
 *
 * @returns – An array of warehouse data.
 */
async function fetchWarehouses(): Promise<Warehouse[]> {
  try {
    const warehouses = await d3.csv(
      "https://raw.githubusercontent.com/Grist-Data-Desk/eto-warehouses/refs/heads/main/eto-warehouses.csv"
    );
    return warehouses.map((d) => ({
      company: d.Company,
      address: d["Warehouse Address"],
      state: d.State,
      source: d.Source,
      type: d.Type,
      latitude: +d.Latitude,
      longitude: +d.Longitude,
    }));
  } catch (error) {
    console.error("Error loading CSV data:", error);
    return [];
  }
}

/**
 * Load warehouse and US Atlas data.
 *
 * @returns – An object containing warehouse and US Atlas data.
 */
export async function loadData(): Promise<{
  warehouses: Warehouse[];
  us: UsAtlas;
}> {
  const warehouses = await fetchWarehouses();
  const us = US_ATLAS as unknown as UsAtlas;

  return {
    warehouses,
    us,
  };
}
