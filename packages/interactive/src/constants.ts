import * as d3 from "d3";

export const WIDTH = 1000;
export const HEIGHT = 600;

export const PROJECTION = d3
  .geoAlbersUsa()
  .scale(1200)
  .translate([WIDTH / 2, HEIGHT / 2]);
export const PR_PROJECTION = d3
  .geoMercator()
  .center([-66.5, 18.2])
  .scale(4000)
  .translate([75, 50]);

export const BASE_DOT_RADIUS = 9;
export const BASE_STROKE_WIDTH = 1;
export const PR_BASE_DOT_RADIUS = 6;
export const USER_LOCATION_DOT_RADIUS = 8;
