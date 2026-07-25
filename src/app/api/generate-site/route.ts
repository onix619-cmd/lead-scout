import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/content-writer";
import { generateLandingPageHTML } from "@/lib/template";
import { deployToVercel } from "@/lib/deploy";
import { getSupabase } from "@/lib/supabase";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const lead: Lead = await req.json();
    if (!lead?.name || !lead?.placeId) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const content = await generateContent(lead);
    const html = generateLandingPageHTML(lead, content);
    const url = await deployToVercel(lead.name, lead.placeId, html);

    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("leads")
        .update({ generated_url: url })
        .eq("place_id", lead.placeId);
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong generating the site" },
      { status: 500 }
    );
  }
}
