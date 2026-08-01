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
      minRating = 0,
      includeNoWebsite = true,
      includeOutdated = true,
      maxResults = 100,
    } = body;

    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    // Province is appended to help geocoding disambiguate similarly-named
    // streets/towns across Canada, even though the actual search area is
    // still the address + radius.
    const fullAddress = province ? `${address}, ${province}, Canada` : address;
    const center = await geocodeAddress(fullAddress);
    const businesses = await searchBusinessesWide({
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
      // No-website leads first, then websites ordered worst score to best
      // (most outdated first) — a clearer "most in need of help" ordering
      // than the old high/medium/low buckets alone.
      if (!a.websiteScore.hasWebsite && b.websiteScore.hasWebsite) return -1;
      if (a.websiteScore.hasWebsite && !b.websiteScore.hasWebsite) return 1;
      if (!a.websiteScore.hasWebsite && !b.websiteScore.hasWebsite) return 0;
      return a.websiteScore.score - b.websiteScore.score;
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
