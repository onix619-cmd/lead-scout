import { NextRequest, NextResponse } from "next/server";
import { searchBusinessesWide } from "@/lib/places";
import { geocodeAddress } from "@/lib/geocode";
import { analyzeWebsite, priorityFromScore } from "@/lib/analyzer";
import { Business, Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category,
      categories,
      address,
      radiusKm = 10,
      minRating = 0,
      includeNoWebsite = true,
      includeOutdated = true,
      maxResults = 100,
    } = body;

    const queries: string[] =
      Array.isArray(categories) && categories.length > 0 ? categories : category ? [category] : [];

    if (queries.length === 0) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    // Worldwide search address without restricted province constraints
    const fullAddress = address;
    const center = await geocodeAddress(fullAddress);

    const batches = await Promise.all(
      queries.map((q) =>
        searchBusinessesWide({
          query: q,
          minRating,
          maxResults,
          locationBias: { center, radiusMeters: radiusKm * 1000 },
        })
      )
    );

    const seen = new Set<string>();
    const businesses: Business[] = [];
    for (const batch of batches) {
      for (const b of batch) {
        if (!seen.has(b.placeId)) {
          seen.add(b.placeId);
          businesses.push(b);
        }
      }
    }

    const leads: Lead[] = await Promise.all(
      businesses.map(async (b) => {
        if (!b.website) {
          return {
            ...b,
            websiteScore: {
              score: 0,
              hasWebsite: false,
              checks: [],
              suggestions: ["No website found — build one from scratch."],
            },
            priority: "high" as const,
          };
        }
        const websiteScore = await analyzeWebsite(b.website);
        return {
          ...b,
          website: websiteScore.hasWebsite ? b.website : null,
          websiteScore,
          priority: priorityFromScore(websiteScore.hasWebsite, websiteScore.score),
          socialLinks: websiteScore.socialLinks,
        };
      })
    );

    const filtered = leads.filter((l) => {
      if (!l.websiteScore.hasWebsite) return includeNoWebsite;
      if (l.websiteScore.score < 75) return includeOutdated;
      return false;
    });

    filtered.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });

    return NextResponse.json({ leads: filtered });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
