import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/content-writer";
import { generateLandingPageHTML } from "@/lib/template";
import { deployToVercel } from "@/lib/deploy";
import { getSupabase } from "@/lib/supabase";
import { fetchPlaceReviews } from "@/lib/reviews";
import { parseMenuText, autoExtractMenuFromWebsite } from "@/lib/menu";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { lead, comment, images, menuText } = payload as {
      lead: Lead;
      comment?: string;
      images?: string[];
      menuText?: string;
    };

    if (!lead?.name || !lead?.placeId) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const realReviews = lead.realReviews ?? (await fetchPlaceReviews(lead.placeId));
    const finalMenuText = menuText ?? lead.menuText;

    let menuSections = finalMenuText ? parseMenuText(finalMenuText) : [];
    let autoExtracted = false;
    if (menuSections.length === 0 && lead.website) {
      const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.GEMINI_API_KEY || "";
      const result = await autoExtractMenuFromWebsite(lead.website, apiKey);
      if (result.menuText) {
        menuSections = parseMenuText(result.menuText);
        autoExtracted = menuSections.length > 0;
      }
    }

    const leadWithImages: Lead = {
      ...lead,
      uploadedImages: images && images.length > 0 ? images : lead.uploadedImages,
      realReviews,
      menuText: finalMenuText,
    };

    const content = await generateContent(leadWithImages, comment);
    const html = generateLandingPageHTML(leadWithImages, content, menuSections);
    const url = await deployToVercel(leadWithImages.name, leadWithImages.placeId, html);

    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("leads")
        .update({ generated_url: url })
        .eq("place_id", leadWithImages.placeId);
    }

    return NextResponse.json({ url, menuAutoExtracted: autoExtracted, menuItemsFound: menuSections.reduce((s, sec) => s + sec.items.length, 0) });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong generating the site" },
      { status: 500 }
    );
  }
}
