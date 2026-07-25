import { NextRequest, NextResponse } from "next/server";

const PLACES_BASE = "https://places.googleapis.com/v1";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_PLACES_API_KEY" }, { status: 500 });
    }
    if (!input || input.trim().length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const res = await fetch(`${PLACES_BASE}/places:autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["ca"],
        languageCode: "en",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Autocomplete error: ${text}` }, { status: 500 });
    }

    const data = await res.json();
    const suggestions = (data.suggestions ?? [])
      .map((s: any) => s.placePrediction)
      .filter(Boolean)
      .map((p: any) => ({ placeId: p.placeId, text: p.text?.text ?? "" }));

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Autocomplete failed" }, { status: 500 });
  }
}
