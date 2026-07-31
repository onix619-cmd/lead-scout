import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Extract all menu items and prices from this image. Format it as plain text with one item per line like 'Name - $Price', and use '## Category' for section headers. Do not include any other text." },
              { inline_data: { mime_type: "image/jpeg", data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "") } }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", errText);
      throw new Error("Failed to extract menu via Gemini");
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ menuText: text });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
