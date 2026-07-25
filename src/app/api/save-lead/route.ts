import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Lead } from "@/lib/types";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase isn't configured yet — see README to enable saving leads." },
      { status: 400 }
    );
  }

  const lead: Lead = await req.json();

  const { error } = await supabase.from("leads").upsert(
    {
      place_id: lead.placeId,
      name: lead.name,
      category: lead.category,
      address: lead.address,
      phone: lead.phone,
      website: lead.website,
      rating: lead.rating,
      review_count: lead.reviewCount,
      maps_url: lead.mapsUrl,
      website_score: lead.websiteScore.score,
      has_website: lead.websiteScore.hasWebsite,
      priority: lead.priority,
      status: "ready",
      contacted: false,
    },
    { onConflict: "place_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
