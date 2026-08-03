"use client";

import { useEffect, useRef, useState } from "react";
import { Lead } from "@/lib/types";

const CATEGORIES = [
  "Restaurants",
  "Coffee shops",
  "Pizza",
  "Bakeries",
  "Bars",
  "Fast food",
  "Interior designers",
  "Hair salons",
  "Nail salons",
  "Barbershops",
  "Spas",
  "Gyms",
  "Yoga studios",
  "Dentists",
  "Chiropractors",
  "Veterinarians",
  "Auto repair shops",
  "Car dealerships",
  "Real estate agents",
  "Lawyers",
  "Accountants",
  "Plumbers",
  "Electricians",
  "HVAC contractors",
  "Roofers",
  "Landscapers",
  "Photographers",
  "Florists",
  "Pet groomers",
  "Daycares",
  "Dry cleaners",
  "Tattoo shops",
  "Jewelry stores",
  "Furniture stores",
  "Bookstores",
];

const RADIUS_OPTIONS = [5, 10, 20, 30, 50];

const PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

const priorityStyle: Record<Lead["priority"], string> = {
  high: "bg-red-50 border-red-300 text-red-700",
  medium: "bg-[#fffbea] border-[#fdc700] text-[#8a6d00]",
  low: "bg-slate-50 border-slate-300 text-slate-500",
};

export default function Dashboard() {
  const [category, setCategory] = useState("Restaurants");
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<{ placeId: string; text: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [province, setProvince] = useState("Quebec");
  const [radiusKm, setRadiusKm] = useState(10);
  const [minRating, setMinRating] = useState(4);
  const [includeNoWebsite, setIncludeNoWebsite] = useState(true);
  const [includeOutdated, setIncludeOutdated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});
  const [genErrors, setGenErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [menuTexts, setMenuTexts] = useState<Record<string, string>>({});
  const [providers, setProviders] = useState<Record<string, "groq" | "gemini">>({});
  const [templateOverrides, setTemplateOverrides] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (address.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: address }),
        });
        const data = await res.json();
        setAddressSuggestions(data.suggestions ?? []);
      } catch {
        setAddressSuggestions([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [address]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLeads([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          address,
          radiusKm,
          province,
          minRating,
          includeNoWebsite,
          includeOutdated,
          maxResults: 100,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setLeads(data.leads);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(placeId: string, files: FileList | null) {
    if (!files) return;
    const readers = Array.from(files)
      .slice(0, 6)
      .map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );
    const dataUrls = await Promise.all(readers);
    setImages((prev) => ({ ...prev, [placeId]: dataUrls }));
  }

  async function handleGenerate(lead: Lead, withComment?: boolean) {
    setGenerating((prev) => new Set(prev).add(lead.placeId));
    setGenErrors((prev) => ({ ...prev, [lead.placeId]: "" }));
    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          images: images[lead.placeId],
          menuText: menuTexts[lead.placeId],
          comment: withComment ? comments[lead.placeId] : undefined,
          provider: providers[lead.placeId] ?? "groq",
          templateOverride: templateOverrides[lead.placeId] || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate site");
      setGeneratedUrls((prev) => ({ ...prev, [lead.placeId]: data.url }));
    } catch (err: any) {
      setGenErrors((prev) => ({ ...prev, [lead.placeId]: err.message }));
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(lead.placeId);
        return next;
      });
    }
  }

  async function handleSave(lead: Lead) {
    const res = await fetch("/api/save-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(lead.placeId));
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef4fb] text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0f2a4a] uppercase">
            Business Website Generator
          </h1>
          <p className="text-slate-500 mt-1">
            Find local businesses near an address and see which ones need a better website.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Category
              </label>
              <div className="flex">
                <input
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setShowCategoryList(true);
                  }}
                  onFocus={() => setShowCategoryList(true)}
                  onBlur={() => setTimeout(() => setShowCategoryList(false), 150)}
                  placeholder="e.g. Restaurants, Plumbers..."
                  autoComplete="off"
                  className="w-full bg-white border border-sky-200 rounded-l-lg px-3 py-2 text-sm text-slate-900 placeholder-sky-400 focus:outline-none focus:border-sky-400"
                />
                {category && (
                  <button
                    type="button"
                    onMouseDown={() => {
                      setCategory("");
                      setShowCategoryList(true);
                    }}
                    className="border border-l-0 border-sky-200 px-2 text-sky-500 text-sm"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onMouseDown={() => setShowCategoryList((prev) => !prev)}
                  className="border border-l-0 border-sky-200 rounded-r-lg px-3 text-sky-500 text-xs"
                  title="Show all categories"
                >
                  ▼
                </button>
              </div>
              {showCategoryList && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-sky-200 rounded-lg shadow-md max-h-56 overflow-y-auto">
                  {(category.trim()
                    ? CATEGORIES.filter((c) => c.toLowerCase().includes(category.toLowerCase()))
                    : CATEGORIES
                  ).map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setCategory(c);
                          setShowCategoryList(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-sky-50"
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                  {category.trim() &&
                    !CATEGORIES.some((c) => c.toLowerCase().includes(category.toLowerCase())) && (
                      <li className="px-3 py-2 text-xs text-slate-400">
                        No matches — you can still search "{category}" as a custom category.
                      </li>
                    )}
                </ul>
              )}
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Address
              </label>
              <input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="123 Main St, Montreal, QC"
                required
                autoComplete="off"
                className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-sky-400 focus:outline-none focus:border-sky-400"
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-sky-200 rounded-lg shadow-md max-h-56 overflow-y-auto">
                  {addressSuggestions.map((s) => (
                    <li key={s.placeId}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setAddress(s.text);
                          setAddressSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-sky-50"
                      >
                        {s.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Search radius
              </label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Minimum rating: {minRating}★
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-green-600 mt-2"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeNoWebsite}
                onChange={(e) => setIncludeNoWebsite(e.target.checked)}
                className="accent-blue-600"
              />
              Businesses without websites
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeOutdated}
                onChange={(e) => setIncludeOutdated(e.target.checked)}
                className="accent-blue-600"
              />
              Businesses with outdated websites
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-green-600 text-white text-sm font-bold uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Fetches up to 100 results within the chosen radius (using a few overlapping sub-searches), sorted by priority.
          </p>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-100 text-sm text-slate-500 uppercase tracking-wide">
              {leads.length} result{leads.length !== 1 ? "s" : ""}
            </div>
            <ul className="divide-y divide-blue-50">
              {leads.map((lead) => (
                <li key={lead.placeId} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{lead.name}</span>
                        <span
                          className={`text-xs border rounded-full px-2 py-0.5 uppercase tracking-wide ${priorityStyle[lead.priority]}`}
                        >
                          {lead.priority} priority
                        </span>
                        {lead.rating && (
                          <span className="text-xs flex items-center gap-0.5">
                            <span className="text-yellow-400">
                              {"★".repeat(Math.round(lead.rating))}
                              <span className="text-slate-200">
                                {"★".repeat(5 - Math.round(lead.rating))}
                              </span>
                            </span>
                            <span className="text-slate-500 ml-1">
                              {lead.rating} ({lead.reviewCount})
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        {lead.address}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs flex-wrap">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`}
                            target="_blank"
                            className="text-[#25D366] font-medium underline underline-offset-2"
                          >
                            WhatsApp
                          </a>
                        )}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="text-slate-600 underline underline-offset-2">
                            {lead.phone}
                          </a>
                        )}
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            className="text-blue-600 underline underline-offset-2"
                          >
                            Visit site ↗
                          </a>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        {lead.websiteScore.hasWebsite ? (
                          <>
                            <span className="font-medium text-blue-600">
                              Website score: {lead.websiteScore.score}/100
                            </span>
                            <button
                              onClick={() =>
                                setExpanded(expanded === lead.placeId ? null : lead.placeId)
                              }
                              className="text-slate-400 underline underline-offset-2"
                            >
                              {expanded === lead.placeId ? "Hide details" : "Show details"}
                            </button>
                          </>
                        ) : (
                          <span className="text-red-600 font-bold">No website</span>
                        )}
                      </div>
                      {expanded === lead.placeId && lead.websiteScore.hasWebsite && (
                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                          <ul className="grid grid-cols-2 gap-1 mb-2">
                            {lead.websiteScore.checks.map((c) => (
                              <li key={c.label} className={c.passed ? "text-slate-700" : "text-slate-400"}>
                                {c.passed ? "✓" : "✕"} {c.label}
                              </li>
                            ))}
                          </ul>
                          {lead.websiteScore.suggestions.length > 0 && (
                            <>
                              <p className="font-bold text-blue-700 mt-2 mb-1">Needs improvement:</p>
                              <ul className="list-disc list-inside text-slate-600">
                                {lead.websiteScore.suggestions.map((s) => (
                                  <li key={s}>{s}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 w-52">
                      {[images[lead.placeId]?.[0] || lead.photoUrl, images[lead.placeId]?.[1] || lead.photoUrl]
                        .filter((src, i, arr): src is string => !!src && arr.indexOf(src) === i)
                        .slice(0, 2).length > 0 && (
                        <div className="flex gap-1.5 w-full">
                          {[images[lead.placeId]?.[0] || lead.photoUrl, images[lead.placeId]?.[1] || lead.photoUrl]
                            .filter((src, i, arr): src is string => !!src && arr.indexOf(src) === i)
                            .slice(0, 2)
                            .map((src, i) => (
                              <img
                                key={i}
                                src={src}
                                alt={lead.name}
                                className="w-1/2 h-28 object-cover rounded-lg border border-slate-200"
                              />
                            ))}
                        </div>
                      )}
                      <label className="text-[11px] text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 w-full text-center cursor-pointer hover:bg-slate-50">
                        {images[lead.placeId]?.length
                          ? `${images[lead.placeId].length} photo(s) added`
                          : "Upload photos"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(lead.placeId, e.target.files)}
                        />
                      </label>
                      <details className="w-full">
                        <summary className="text-[11px] text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 text-center cursor-pointer hover:bg-slate-50 list-none">
                          {menuTexts[lead.placeId]?.trim() ? "Menu added ✓" : "Paste real menu (optional)"}
                        </summary>
                        <textarea
                          value={menuTexts[lead.placeId] ?? ""}
                          onChange={(e) =>
                            setMenuTexts((prev) => ({ ...prev, [lead.placeId]: e.target.value }))
                          }
                          placeholder={"## Starters\nCaesar Salad - $12\nSoup of the Day - $8\n\n## Mains\nGrilled Salmon - $24"}
                          rows={5}
                          className="w-full mt-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-[11px] px-2 py-1.5 placeholder-slate-400 focus:outline-none focus:border-sky-400"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          One item per line: "Name - $Price". Use "## Category" for section headers.
                        </p>
                      </details>
                      <div className="w-full">
                        <label className="text-[10px] text-slate-500 block mb-1">Website template</label>
                        <select
                          value={templateOverrides[lead.placeId] ?? ""}
                          onChange={(e) =>
                            setTemplateOverrides((prev) => ({ ...prev, [lead.placeId]: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 text-[11px] px-2 py-1.5 focus:outline-none focus:border-sky-400"
                        >
                          <option value="">Auto (by category)</option>
                          <option value="restaurant-1">Restaurant — Style 1</option>
                          <option value="restaurant-2">Restaurant — Style 2</option>
                          <option value="coffee">Coffee Shop</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="text-[10px] text-slate-500 block mb-1">AI provider</label>
                        <select
                          value={providers[lead.placeId] ?? "groq"}
                          onChange={(e) =>
                            setProviders((prev) => ({ ...prev, [lead.placeId]: e.target.value as "groq" | "gemini" }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 text-[11px] px-2 py-1.5 focus:outline-none focus:border-sky-400"
                        >
                          <option value="groq">Groq</option>
                          <option value="gemini">Gemini</option>
                        </select>
                      </div>
                      {generatedUrls[lead.placeId] ? (
                        <a
                          href={generatedUrls[lead.placeId]}
                          target="_blank"
                          className="text-xs font-bold text-white rounded-lg px-3 py-1.5 bg-green-600 hover:bg-green-500 whitespace-nowrap text-center w-full uppercase"
                        >
                          View live site ↗
                        </a>
                      ) : (
                        <button
                          onClick={() => handleGenerate(lead)}
                          disabled={generating.has(lead.placeId)}
                          className="text-xs font-bold text-blue-600 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-50 disabled:opacity-50 whitespace-nowrap w-full uppercase"
                        >
                          {generating.has(lead.placeId)
                            ? "Generating…"
                            : lead.websiteScore.hasWebsite
                            ? "Generate Better Website"
                            : "Generate Website"}
                        </button>
                      )}
                      {generatedUrls[lead.placeId] && (
                        <div className="w-full">
                          <textarea
                            value={comments[lead.placeId] ?? ""}
                            onChange={(e) =>
                              setComments((prev) => ({ ...prev, [lead.placeId]: e.target.value }))
                            }
                            placeholder="e.g. darker colors, add brunch mention..."
                            rows={2}
                            className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 text-[11px] px-2 py-1.5 placeholder-slate-400 focus:outline-none focus:border-sky-400"
                          />
                          <button
                            onClick={() => handleGenerate(lead, true)}
                            disabled={generating.has(lead.placeId) || !comments[lead.placeId]?.trim()}
                            className="mt-1 text-[11px] font-bold text-blue-600 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-50 disabled:opacity-40 whitespace-nowrap w-full uppercase"
                          >
                            {generating.has(lead.placeId) ? "Regenerating…" : "Regenerate with feedback"}
                          </button>
                        </div>
                      )}
                      {genErrors[lead.placeId] && (
                        <p className="text-xs text-red-600 text-right">{genErrors[lead.placeId]}</p>
                      )}
                      <button
                        onClick={() => handleSave(lead)}
                        disabled={savedIds.has(lead.placeId)}
                        className="text-xs font-medium border border-slate-300 text-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap w-full"
                      >
                        {savedIds.has(lead.placeId) ? "Saved ✓" : "Save to CRM"}
                      </button>
                      <a
                        href={lead.mapsUrl}
                        target="_blank"
                        className="text-xs text-slate-400 underline underline-offset-2"
                      >
                        View on Maps
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
