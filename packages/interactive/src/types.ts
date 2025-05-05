/**
 * Represents a user selected location on the map.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Represents the US Atlas TopoJSON.
 */
export interface UsAtlas extends TopoJSON.Topology {
  objects: {
    states: {
      type: "GeometryCollection";
      geometries: Array<TopoJSON.Polygon | TopoJSON.MultiPolygon>;
    };
    nation: TopoJSON.GeometryCollection;
  };
  bbox: [number, number, number, number];
  transform: TopoJSON.Transform;
}

/**
 * Represents a warehouse on the map.
 */
export interface Warehouse {
  company: string;
  address: string;
  state: string;
  source: string;
  type: string;
  latitude: number;
  longitude: number;
}

/**
 * Represents a hit from the OpenStreetMap Nominatim API.
 */
export interface NominatimHit {
  display_name: string;
  lat: number;
  lon: number;
}
