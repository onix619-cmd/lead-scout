import { Business } from "./types";

const PLACES_BASE = "https://places.googleapis.com/v1";

// Uses the new Places API (Text Search + Place Details).
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
export async function searchBusinesses(
  query: string,
  minRating: number,
  maxResults: number = 20
): Promise<Business[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_PLACES_API_KEY. Add it to your .env.local file."
    );
  }

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.regularOpeningHours",
    "places.googleMapsUri",
    "places.photos",
    "places.primaryTypeDisplayName",
  ].join(",");

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: Math.min(maxResults, 20),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Places API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const places = data.places ?? [];

  return places
    .map((p: any): Business => ({
      placeId: p.id,
      name: p.displayName?.text ?? "Unknown",
      category: p.primaryTypeDisplayName?.text ?? "Business",
      address: p.formattedAddress ?? "",
      phone: p.internationalPhoneNumber ?? null,
      website: p.websiteUri ?? null,
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? 0,
      openingHours: p.regularOpeningHours?.weekdayDescriptions ?? [],
      mapsUrl: p.googleMapsUri ?? "",
      photoUrl:
        p.photos && p.photos.length > 0
          ? `${PLACES_BASE}/${p.photos[0].name}/media?maxWidthPx=800&key=${apiKey}`
          : null,
    }))
    .filter((b: Business) => (b.rating ?? 0) >= minRating);
}
