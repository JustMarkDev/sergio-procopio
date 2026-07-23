const GOOGLE_MAPS_SEARCH_URL = "https://www.google.com/maps/search/";

export function createGoogleMapsSearchUrl(address: string, city: string) {
  const url = new URL(GOOGLE_MAPS_SEARCH_URL);
  const query = `${address.trim()}, ${city.trim()}`;

  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);

  return url.toString();
}
