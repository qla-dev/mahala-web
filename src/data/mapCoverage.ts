import countries from './map-countries.json';

// Boundary geometry from the native map's full and border datasets for BA, HR, and RS.
export type MapArea = {
  id: string;
  name: string;
  bounds: number[];
  polygons: number[][][][];
};

export const mapCountries: MapArea[] = countries;

const regionalBoundaries = {
  BA: () => import('./map-regions-ba.json'),
  HR: () => import('./map-regions-hr.json'),
  RS: () => import('./map-regions-rs.json'),
};

export async function loadMapRegions(countryId: string): Promise<MapArea[]> {
  const load = regionalBoundaries[countryId as keyof typeof regionalBoundaries];
  return load ? (await load()).default : [];
}
