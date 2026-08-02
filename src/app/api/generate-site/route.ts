import { NextRequest, NextResponse } from "next/server";
import { generateContent, AiProvider } from "@/lib/content-writer";
import { generateLandingPageHTML } from "@/lib/template";
import { deployToVercel } from "@/lib/deploy";
import { getSupabase } from "@/lib/supabase";
import { fetchPlaceReviews } from "@/lib/reviews";
import { parseMenuText, extractMenuFromWebsite } from "@/lib/menu";
import { extractMenuFromImages } from "@/lib/menu-vision";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { lead, comment, images, menuText, provider } = payload as {
      lead: Lead;
      comment?: string;
      images?: string[];
      menuText?: string;
      provider?: AiProvider;
    };

    if (!lead?.name || !lead?.placeId) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const aiProvider: AiProvider = provider ?? "xai";
    const realReviews = lead.realReviews ?? (await fetchPlaceReviews(lead.placeId));
    const finalMenuText = menuText ?? lead.menuText;
    const uploadedImages = images && images.length > 0 ? images : lead.uploadedImages;

    // Priority: manually pasted menu > auto-read from uploaded photos >
    // scraped from the business's own website text > nothing (falls back
    // to a "View Full Menu" link to their real site, if they have one).
    let menuSections = finalMenuText ? parseMenuText(finalMenuText) : [];
    let menuSource: "manual" | "photos" | "website" | "none" = menuSections.length > 0 ? "manual" : "none";

    if (menuSections.length === 0 && uploadedImages && uploadedImages.length > 0) {
      menuSections = await extractMenuFromImages(uploadedImages, aiProvider);
      if (menuSections.length > 0) menuSource = "photos";
    }
    if (menuSections.length === 0 && lead.website) {
      menuSections = await extractMenuFromWebsite(lead.website);
      if (menuSections.length > 0) menuSource = "website";
    }

    const leadWithImages: Lead = {
      ...lead,
      uploadedImages,
      realReviews,
      menuText: finalMenuText,
    };

    const content = await generateContent(leadWithImages, comment, aiProvider);
    const html = generateLandingPageHTML(leadWithImages, content, menuSections);
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
      menuSource,
      menuItemsFound: menuSections.reduce((s, sec) => s + sec.items.length, 0),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong generating the site" },
      { status: 500 }
    );
  }
}
