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
    photoUrls:
      p.photos && p.photos.length > 0
        ? p.photos.slice(0, 10).map((ph: any) => `${PLACES_BASE}/${ph.name}/media?maxWidthPx=1000&key=${apiKey}`)
        : [],
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
  maxResults?: number; // up to 60 per single query (Google's hard cap)
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

  const capped = Math.min(maxResults, 60); // Places New API: 20 per page, up to 3 pages — Google's own hard limit per query
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

// Google hard-caps a single Text Search at 60 results, full stop — no
// parameter or paid tier raises it. To reach up to 100, we run the same
// query from a few offset points within the radius (soft location bias,
// same as a single search) and merge unique businesses by place ID. This
// means more Google API calls per search than before — worth knowing if
// you're watching usage/cost.
function offsetPoint(center: LatLng, distanceMeters: number, bearingDeg: number): LatLng {
  const R = 6371000; // Earth radius in meters
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (center.lat * Math.PI) / 180;
  const lng1 = (center.lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceMeters / R) +
      Math.cos(lat1) * Math.sin(distanceMeters / R) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distanceMeters / R) * Math.cos(lat1),
      Math.cos(distanceMeters / R) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

export async function searchBusinessesWide(params: SearchParams): Promise<Business[]> {
  const target = Math.min(params.maxResults ?? 60, 100);

  // No radius given (e.g. whole-province search) — can't sensibly subdivide,
  // so just return a single query capped at Google's 60-result ceiling.
  if (!params.locationBias || target <= 60) {
    return searchBusinesses({ ...params, maxResults: Math.min(target, 60) });
  }

  const { center, radiusMeters } = params.locationBias;
  // Center plus 4 cardinal offset points, each still searching the full
  // original radius (it's a soft bias, not a hard boundary) — this covers
  // more of the area's actual listings, especially in denser cities.
  const points: LatLng[] = [
    center,
    offsetPoint(center, radiusMeters * 0.6, 0),
    offsetPoint(center, radiusMeters * 0.6, 90),
    offsetPoint(center, radiusMeters * 0.6, 180),
    offsetPoint(center, radiusMeters * 0.6, 270),
  ];

  const batches = await Promise.all(
    points.map((p) =>
      searchBusinesses({
        ...params,
        maxResults: 60,
        locationBias: { center: p, radiusMeters },
      }).catch(() => [] as Business[])
    )
  );

  const seen = new Set<string>();
  const merged: Business[] = [];
  for (const batch of batches) {
    for (const b of batch) {
      if (!seen.has(b.placeId)) {
        seen.add(b.placeId);
        merged.push(b);
      }
    }
  }

  return merged.slice(0, target);
}
