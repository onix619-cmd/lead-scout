export type PlaceReview = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
};

const PLACES_BASE = "https://places.googleapis.com/v1";

// Fetches up to 5 real Google reviews for a place (that's the API's own
// cap). These are genuine reviewer-submitted text, shown with attribution
// per Google's Places API display requirements — not AI-generated content.
export async function fetchPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const reviews = data.reviews ?? [];
    return reviews
      .map((r: any) => ({
        authorName: r.authorAttribution?.displayName ?? "Google user",
        rating: r.rating ?? 0,
        text: (r.text?.text ?? "").trim(),
        relativeTime: r.relativePublishTimeDescription ?? "",
      }))
      .filter((r: PlaceReview) => r.text.length > 0)
      .sort((a: PlaceReview, b: PlaceReview) => b.rating - a.rating)
      .slice(0, 3);
  } catch {
    return [];
  }
}
