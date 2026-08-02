export type LatLng = { lat: number; lng: number };

// Uses the Geocoding API to turn a typed address into coordinates.
// Requires "Geocoding API" enabled on the same Google Cloud project as
// Places API (New) — same API key works, just needs the extra API enabled.
export async function geocodeAddress(address: string): Promise<LatLng> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to your environment variables.");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(
      `Couldn't find that address (${data.status}). Try a more specific address, or make sure "Geocoding API" is enabled in Google Cloud Console.`
    );
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}
