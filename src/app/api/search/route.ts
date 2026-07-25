import { NextRequest, NextResponse } from "next/server";
import { searchBusinesses } from "@/lib/places";
import { geocodeAddress } from "@/lib/geocode";
import { analyzeWebsite, priorityFromScore } from "@/lib/analyzer";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category,
      address,
      radiusKm = 10,
      minRating = 0,
      includeNoWebsite = true,
      includeOutdated = true,
      maxResults = 50,
    } = body;

    if (!category || !address) {
      return NextResponse.json(
        { error: "category and address are required" },
        { status: 400 }
      );
    }

    const center = await geocodeAddress(address);

    const businesses = await searchBusinesses({
      query: category,
      minRating,
      maxResults,
      locationBias: { center, radiusMeters: radiusKm * 1000 },
    });

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
          websiteScore,
          priority: priorityFromScore(true, websiteScore.score),
          socialLinks: websiteScore.socialLinks,
        };
      })
    );

    const filtered = leads.filter((l) => {
      if (!l.websiteScore.hasWebsite) return includeNoWebsite;
      if (l.websiteScore.score < 75) return includeOutdated;
      return true;
    });

    filtered.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });

    return NextResponse.json({ leads: filtered, center });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}
