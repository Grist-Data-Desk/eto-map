import type { NominatimHit } from "./types";

/**
 * Queries the OpenStreetMap Nominatim API for suggestions based on a search query.
 *
 * @param query - The search query.
 * @param resultLimit - The maximum number of results to return.
 * @returns A promise that resolves to an array of NominatimHit objects.
 */
export async function queryNominatim(
  query: string,
  resultLimit = 5
): Promise<NominatimHit[]> {
  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=us,pr&limit=${resultLimit}`;

    const response = await fetch(endpoint, {
      headers: {
        "User-Agent":
          "Grist EtO Warehouse Map/1.0 (contact: caldern@grist.org)",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data as NominatimHit[];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
