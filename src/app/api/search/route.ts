import { NextRequest, NextResponse } from "next/server";
import { searchBusinesses } from "@/lib/places";
import { analyzeWebsite, priorityFromScore } from "@/lib/analyzer";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, city, minRating = 0, includeNoWebsite = true, includeOutdated = true } = body;

    if (!category || !city) {
      return NextResponse.json(
        { error: "category and city are required" },
        { status: 400 }
      );
    }

    const businesses = await searchBusinesses(`${category} in ${city}`, minRating);

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

    return NextResponse.json({ leads: filtered });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}
