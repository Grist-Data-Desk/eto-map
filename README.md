# ETO Map

This repository contains the source code for the interactive map, "Warehouses storing products sterilized with ethylene oxide", featured in, ["The unregulated link in a toxic supply chain."](https://grist.org/health/ethylene-oxide-el-paso-texas-unregulated-toxic-warehouse/)

## Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/) (v10.10.0 or later)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/Grist-Data-Desk/eto-map
cd eto-map
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build on `http://localhost:4173`

### Code Quality

- `pnpm format` - Format code with Prettier
- `pnpm lint` - Run linting checks and Prettier verification

## Technology Stack

- [D3.js](https://d3js.org/) - Mapping
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces) - Data storage and CDN
- [Turf.js](https://turfjs.org/) - Geospatial analysis
- [Vite](https://vitejs.dev/) - Build tool
- [Prettier](https://prettier.io/) - Code formatting
- [ESLint](https://eslint.org/) - Code linting

This project also uses [`iframe-resizer`](https://github.com/davidjbradshaw/iframe-resizer) for the production deployment on the Grist site. This allows us to embed the map inline in a larger article without needing to worry about the `iframe` introducing additional scroll overflow into the page.

## Project Structure

- `/packages/interactive` - The main project code for the interactive map
  - `src/index.ts` - The main entry point for the interactive
  - `src/constants.ts` - Constants used throughout the project
  - `src/data.ts` - Functions for fetching and processing warehouse data and US state and national boundaries
  - `src/location.ts` – Function for locating the nearest warehouse to the user's location
  - `src/map.ts` - The main logic for drawing the map
  - `src/marker.ts` - Functions for creating and removing the user location marker on the map
  - `src/nominatim.ts` - Function for querying the OpenStreetMap Nominatim API
  - `src/reset.ts` - Functions for resetting the map to the default view
  - `src/search.ts` – Functions for handling search interactions
  - `src/suggestions.ts` – Functions for handling suggestions in the search bar
  - `src/tooltip.ts` - Functions for creating and removing the tooltip
  - `src/types.ts` - TypeScript types
  - `src/utils.ts` - Utility functions
  - `src/zoom.ts` - Functions for handling zoom interactions
- `/packages/scripts` - The code used to scrape the data from the source website
  - `src/deploy.ts` - Functions for deploying the map to Grist's Digital Ocean Spaces bucket

## Embedding the Map

The map can be embedded in other websites using an `iframe`. Here's an example:

```html
<iframe
  src="https://grist.org/project/updates/interactive-warehouses-storing-products-sterilized-with-ethylene-oxide/"
></iframe>
```
