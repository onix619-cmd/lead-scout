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
      province,
      minRating = 0,
      includeNoWebsite = true,
      includeOutdated = true,
      maxResults = 100,
    } = body;

    // Either a single category ("Restaurants") or a combined-search group
    // (["Restaurants", "Pizza", "Fast food"]) must be provided.
    const queries: string[] =
      Array.isArray(categories) && categories.length > 0 ? categories : category ? [category] : [];

    if (queries.length === 0) {
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

    // For a combined-search group, run each category's search in parallel
    // against the same area and merge unique businesses by place ID. Each
    // query still gets up to `maxResults`, so the group as a whole can
    // return more than a single-category search would.
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

    // No-website leads first, then leads with a website — that priority
    // grouping stays fixed. Within each group, order is shuffled fresh on
    // every search instead of sorted, so you don't see the same order
    // every time you search the same area/category.
    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    const withoutWebsite = shuffle(filtered.filter((l) => !l.websiteScore.hasWebsite));
    const withWebsite = shuffle(filtered.filter((l) => l.websiteScore.hasWebsite));
    const finalLeads = [...withoutWebsite, ...withWebsite];

    return NextResponse.json({ leads: finalLeads, center });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}
