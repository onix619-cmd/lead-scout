import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/content-writer";
import { generateLandingPageHTML, TemplateOverride } from "@/lib/template";
import { deployToVercel } from "@/lib/deploy";
import { getSupabase } from "@/lib/supabase";
import { fetchPlaceReviews } from "@/lib/reviews";
import { parseMenuText, autoExtractMenuFromImages, extractMenuFromWebsite } from "@/lib/menu";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { lead, comment, images, menuText, templateOverride } = payload as {
      lead: Lead;
      comment?: string;
      images?: string[];
      menuText?: string;
      templateOverride?: TemplateOverride;
    };

    if (!lead?.name || !lead?.placeId) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const realReviews = lead.realReviews ?? (await fetchPlaceReviews(lead.placeId));
    let finalMenuText = menuText ?? lead.menuText;
    const apiKey = process.env.GEMINI_API_KEY || process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";

    let menuSections = finalMenuText ? parseMenuText(finalMenuText) : [];
    let autoExtracted = false;

    // 1. Try Gemini Vision OCR on photos if no menu text yet
    if (menuSections.length === 0) {
      const availablePhotos = [
        ...(images ?? []),
        lead.photoUrl,
      ].filter((p): p is string => !!p);

      if (availablePhotos.length > 0 && apiKey) {
        const extractedText = await autoExtractMenuFromImages(availablePhotos, apiKey);
        if (extractedText) {
          menuSections = parseMenuText(extractedText);
          autoExtracted = menuSections.length > 0;
        }
      }
    }

    // 2. Fallback to website text scraping if still empty
    if (menuSections.length === 0 && lead.website) {
      menuSections = await extractMenuFromWebsite(lead.website);
      autoExtracted = menuSections.length > 0;
    }

    const leadWithImages: Lead = {
      ...lead,
      uploadedImages: images && images.length > 0 ? images : lead.uploadedImages,
      realReviews,
      menuText: finalMenuText,
    };

    const content = await generateContent(leadWithImages, comment);
    const html = generateLandingPageHTML(
      leadWithImages,
      content,
      menuSections,
      "A",
      undefined,
      templateOverride
    );
    const url = await deployToVercel(leadWithImages.name, leadWithImages.placeId, html);

    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("leads")
        .update({ generated_url: url })
        .eq("place_id", leadWithImages.placeId);
    }

    return NextResponse.json({
      url,
      menuAutoExtracted: autoExtracted,
      menuItemsFound: menuSections.reduce((s, sec) => s + sec.items.length, 0),
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong generating the site" },
      { status: 500 }
    );
  }
}
