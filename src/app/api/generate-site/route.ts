import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/content-writer";
import { generateLandingPageHTML } from "@/lib/template";
import { deployToVercel } from "@/lib/deploy";
import { getSupabase } from "@/lib/supabase";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { lead, comment, images } = payload as {
      lead: Lead;
      comment?: string;
      images?: string[];
    };

    if (!lead?.name || !lead?.placeId) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const leadWithImages: Lead = {
      ...lead,
      uploadedImages: images && images.length > 0 ? images : lead.uploadedImages,
    };

    const content = await generateContent(leadWithImages, comment);
    const html = generateLandingPageHTML(leadWithImages, content);
    const url = await deployToVercel(leadWithImages.name, leadWithImages.placeId, html);

    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("leads")
        .update({ generated_url: url })
        .eq("place_id", leadWithImages.placeId);
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
