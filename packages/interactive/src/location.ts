import * as turf from "@turf/turf";

import { UserLocation, Warehouse } from "./types";

/**
 * Find the nearest warehouse to the user's location.
 *
 * @param userLocation – The user's location.
 * @param warehouses – The warehouses to search.
 *
 * @returns – The nearest warehouse and the distance to it.
 */
export function findNearestWarehouse(
  userLocation: UserLocation,
  warehouses: Warehouse[]
) {
  let minDistance = Infinity;
  let nearestWarehouse: Warehouse = warehouses[0];

  warehouses.forEach((warehouse) => {
    const distance = turf.distance(
      turf.point([userLocation.longitude, userLocation.latitude]),
      turf.point([warehouse.longitude, warehouse.latitude]),
      { units: "miles" }
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestWarehouse = warehouse;
    }
  });

  return { warehouse: nearestWarehouse, distance: minDistance };
}
