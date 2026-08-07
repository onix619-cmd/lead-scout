import { NextRequest, NextResponse } from "next/server";
import { searchBusinesses } from "@/lib/places";
import { analyzeWebsite, priorityFromScore } from "@/lib/analyzer";
import { Lead } from "@/lib/types";

export const maxDuration = 30;

// Looks up whatever business is actually located at a specific address the
// user already knows, rather than searching a category + radius. Google's
// Text Search resolves a full address well on its own when a real business
// exists there, so no extra location bias is needed here.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body as { address?: string };

    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    const businesses = await searchBusinesses({
      query: address,
      minRating: 0,
      maxResults: 5,
    });

    if (businesses.length === 0) {
      return NextResponse.json(
        { error: "No business found at that address. Try a more specific address (include the business name if you know it)." },
        { status: 404 }
      );
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

    return NextResponse.json({ leads });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}
