import { NextRequest, NextResponse } from "next/server";
import { generateContent, AiProvider } from "@/lib/content-writer";
import { generateLandingPageHTML, TemplateOverride } from "@/lib/template";
import { deployToVercel } from "@/lib/deploy";
import { getSupabase } from "@/lib/supabase";
import { fetchPlaceReviews } from "@/lib/reviews";
import { parseMenuText, extractMenuFromWebsite } from "@/lib/menu";
import { extractMenuFromImages, detectMenuFromGooglePhotos } from "@/lib/menu-vision";
import { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { lead, comment, images, menuText, provider, templateOverride } = payload as {
      lead: Lead;
      comment?: string;
      images?: string[];
      menuText?: string;
      provider?: AiProvider;
      templateOverride?: TemplateOverride;
    };

    if (!lead?.name || !lead?.placeId) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const aiProvider: AiProvider = provider ?? "claude";
    const realReviews = lead.realReviews ?? (await fetchPlaceReviews(lead.placeId));
    const finalMenuText = menuText ?? lead.menuText;
    const uploadedImages = images && images.length > 0 ? images : lead.uploadedImages;

    // Pipeline order:
    // 1. Manually pasted menu text (fastest, most reliable when available)
    // 2. Check Supabase for a previously-extracted menu for this business
    // 3. Auto-detect from the business's real Google Maps photos via Claude
    //    Vision — no upload needed, this is the main automatic path
    // 4. Auto-read from photos you manually uploaded, via selected provider
    // 5. Scraped from the business's own website text
    // 6. Nothing found — falls back to a "View Full Menu" link/placeholder
    let menuSections = finalMenuText ? parseMenuText(finalMenuText) : [];
    let menuSource: "manual" | "cached" | "google-photos" | "photos" | "website" | "none" =
      menuSections.length > 0 ? "manual" : "none";
    let originalMenuPhotoUrl: string | undefined;

    const supabase = getSupabase();

    if (menuSections.length === 0 && supabase) {
      const { data: cached } = await supabase
        .from("leads")
        .select("menu_json, menu_source_photo_url")
        .eq("place_id", lead.placeId)
        .maybeSingle();
      if (cached?.menu_json?.length) {
        menuSections = cached.menu_json;
        originalMenuPhotoUrl = cached.menu_source_photo_url ?? undefined;
        menuSource = "cached";
      }
    }

    if (menuSections.length === 0 && lead.photoUrls && lead.photoUrls.length > 0) {
      const result = await detectMenuFromGooglePhotos(lead.photoUrls);
      if (result.sections.length > 0) {
        menuSections = result.sections;
        originalMenuPhotoUrl = result.sourcePhotoUrl;
        menuSource = "google-photos";
      }
    }

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
    const html = generateLandingPageHTML(leadWithImages, content, menuSections, undefined, originalMenuPhotoUrl, templateOverride);
    const url = await deployToVercel(leadWithImages.name, leadWithImages.placeId, html);

    if (supabase) {
      const update: Record<string, any> = { generated_url: url };
      if (menuSource === "google-photos" || menuSource === "photos") {
        update.menu_json = menuSections;
        update.menu_source_photo_url = originalMenuPhotoUrl ?? null;
      }
      await supabase.from("leads").update(update).eq("place_id", leadWithImages.placeId);
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
