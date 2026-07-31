import { NextRequest, NextResponse } from "next/server";
import { searchBusinessesWide } from "@/lib/places";
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
      province,
      mode = "address", // "address" | "province"
      minRating = 0,
      includeNoWebsite = true,
      includeOutdated = true,
      maxResults = 100,
    } = body;

    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }
    if (mode === "address" && !address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }
    if (mode === "province" && !province) {
      return NextResponse.json({ error: "province is required" }, { status: 400 });
    }

    let businesses;
    let center;

    if (mode === "province") {
      businesses = await searchBusinessesWide({
        query: `${category} in ${province}, Canada`,
        minRating,
        maxResults,
      });
    } else {
      center = await geocodeAddress(address);
      businesses = await searchBusinessesWide({
        query: category,
        minRating,
        maxResults,
        locationBias: { center, radiusMeters: radiusKm * 1000 },
      });
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
      const aNoWeb = !a.websiteScore.hasWebsite;
      const bNoWeb = !b.websiteScore.hasWebsite;
      if (aNoWeb && !bNoWeb) return -1;
      if (!aNoWeb && bNoWeb) return 1;
      
      return a.websiteScore.score - b.websiteScore.score;
    });

    return NextResponse.json({ leads: filtered, center });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
