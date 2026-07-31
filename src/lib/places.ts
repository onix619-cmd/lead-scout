import { Business } from "./types";
import { LatLng } from "./geocode";

const PLACES_BASE = "https://places.googleapis.com/v1";

const FIELD_MASK = [
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
  "places.takeout",
  "places.delivery",
  "places.dineIn",
  "places.reservable",
  "places.outdoorSeating",
  "places.servesBeer",
  "places.servesWine",
  "nextPageToken",
].join(",");

function mapPlace(p: any, apiKey: string): Business {
  return {
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
    diningOptions: {
      takeout: p.takeout,
      delivery: p.delivery,
      dineIn: p.dineIn,
      reservable: p.reservable,
      outdoorSeating: p.outdoorSeating,
      servesBeer: p.servesBeer,
      servesWine: p.servesWine,
    },
  };
}

export type SearchParams = {
  query: string;
  minRating: number;
  maxResults?: number; // up to 60 (3 pages of 20)
  locationBias?: { center: LatLng; radiusMeters: number };
};

// Uses the new Places API (Text Search + Place Details).
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
export async function searchBusinesses({
  query,
  minRating,
  maxResults = 20,
  locationBias,
}: SearchParams): Promise<Business[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_PLACES_API_KEY. Add it to your .env.local file."
    );
  }

  const capped = Math.min(maxResults, 60); // Places New API: 20 per page, up to 3 pages
  const results: Business[] = [];
  let pageToken: string | undefined;

  do {
    const body: Record<string, any> = {
      textQuery: query,
      pageSize: 20,
    };
    if (pageToken) body.pageToken = pageToken;
    if (locationBias) {
      body.locationBias = {
        circle: {
          center: { latitude: locationBias.center.lat, longitude: locationBias.center.lng },
          radius: locationBias.radiusMeters,
        },
      };
    }

    const res: Response = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Places API error (${res.status}): ${text}`);
    }

    const data: any = await res.json();
    const places = data.places ?? [];
    results.push(...places.map((p: any) => mapPlace(p, apiKey)));

    pageToken = data.nextPageToken;
    // Google requires a short delay before a page token becomes valid.
    if (pageToken && results.length < capped) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  } while (pageToken && results.length < capped);

  return results.slice(0, capped).filter((b) => (b.rating ?? 0) >= minRating);
}
