"use client";

import { useEffect, useRef, useState } from "react";
import { Lead } from "@/lib/types";

const CATEGORY_GROUPS: { group: string; emoji: string; items: string[] }[] = [
  {
    group: "Food Service",
    emoji: "🍽️",
    items: ["Restaurants", "Pizza", "Fast food"],
  },
  {
    group: "Coffee & Bars",
    emoji: "☕",
    items: ["Coffee shops", "Bars"],
  },
  {
    group: "Health Care",
    emoji: "💆",
    items: ["Spas", "Gyms", "Yoga studios"],
  },
  {
    group: "Beauty Care",
    emoji: "💅",
    items: ["Nail salons", "Hair salons", "Barbershops"],
  },
  {
    group: "Other",
    emoji: "📌",
    items: [
      "Bakeries",
      "Interior designers",
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
    ],
  },
];

// The four groups people can search as a single combined query — clicking
// one of these runs the search across every category listed under it and
// merges the results (deduped by place). "Other" is excluded since it's a
// grab-bag, not a real combined-search group.
const QUICK_GROUPS = CATEGORY_GROUPS.filter((g) => g.group !== "Other");

// Flat list kept for filtering/matching logic elsewhere in this file.
const CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items);

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

function getTheme(dark: boolean) {
  return {
    page: dark ? "bg-[#0b1220] text-slate-100" : "bg-[#eef4fb] text-slate-900",
    heading: dark ? "text-white" : "text-[#0f2a4a]",
    subtext: dark ? "text-slate-400" : "text-slate-500",
    card: dark ? "bg-[#111827] border-slate-700" : "bg-white border-blue-100",
    label: dark ? "text-slate-300" : "text-slate-600",
    input: dark
      ? "bg-[#0b1220] border-slate-600 text-slate-100 placeholder-slate-500 focus:border-blue-400"
      : "bg-white border-sky-200 text-slate-900 placeholder-sky-400 focus:border-sky-400",
    dropdown: dark ? "bg-[#111827] border-slate-600" : "bg-white border-sky-200",
    dropdownItem: dark ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-sky-50",
    dropdownMuted: dark ? "text-slate-500" : "text-slate-400",
    checkboxText: dark ? "text-slate-300" : "text-slate-700",
    helperText: dark ? "text-slate-500" : "text-slate-400",
    resultsHeaderBorder: dark ? "border-slate-700" : "border-blue-100",
    resultsHeaderText: dark ? "text-slate-400" : "text-slate-500",
    divide: dark ? "divide-slate-800" : "divide-blue-50",
    leadName: dark ? "text-white" : "text-slate-900",
    leadAddress: dark ? "text-slate-400" : "text-slate-500",
    phoneLink: dark ? "text-slate-300" : "text-slate-600",
    scoreText: dark ? "text-blue-400" : "text-blue-600",
    showDetails: dark ? "text-slate-500" : "text-slate-400",
    expandedBox: dark ? "bg-[#0b1220] border-slate-700" : "bg-slate-50 border-slate-200",
    checkPassed: dark ? "text-slate-300" : "text-slate-700",
    checkFailed: dark ? "text-slate-600" : "text-slate-400",
    improveHeading: dark ? "text-blue-400" : "text-blue-700",
    improveList: dark ? "text-slate-400" : "text-slate-600",
    thumbBorder: dark ? "border-slate-700" : "border-slate-200",
    secondaryBtn: dark
      ? "text-slate-300 border-slate-600 hover:bg-slate-800"
      : "text-slate-600 border-slate-300 hover:bg-slate-50",
    primaryOutlineBtn: dark
      ? "text-blue-400 border-blue-500 hover:bg-blue-950"
      : "text-blue-600 border-blue-300 hover:bg-blue-50",
    mapsLink: dark ? "text-slate-500" : "text-slate-400",
  };
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const t = getTheme(darkMode);

  const [category, setCategory] = useState("Restaurants");
  // When set, a combined-search group is active (e.g. "Food Service" ->
  // Restaurants + Pizza + Fast food searched together). Cleared whenever the
  // person types a custom category or picks a single one from the dropdown.
  const [categoryGroup, setCategoryGroup] = useState<{ group: string; items: string[] } | null>(null);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<{ placeId: string; text: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [province, setProvince] = useState("Quebec");
  const [radiusKm, setRadiusKm] = useState(10);
  const [minRating, setMinRating] = useState(4);
  const [includeNoWebsite, setIncludeNoWebsite] = useState(true);
  const [includeOutdated, setIncludeOutdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantAddressSuggestions, setRestaurantAddressSuggestions] = useState<{ placeId: string; text: string }[]>([]);
  const [showRestaurantSuggestions, setShowRestaurantSuggestions] = useState(false);
  const [findingByAddress, setFindingByAddress] = useState(false);
  const [findByAddressError, setFindByAddressError] = useState<string | null>(null);
  const restaurantDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    if (restaurantDebounceRef.current) clearTimeout(restaurantDebounceRef.current);
    if (restaurantAddress.trim().length < 3) {
      setRestaurantAddressSuggestions([]);
      return;
    }
    restaurantDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: restaurantAddress }),
        });
        const data = await res.json();
        setRestaurantAddressSuggestions(data.suggestions ?? []);
      } catch {
        setRestaurantAddressSuggestions([]);
      }
    }, 300);
    return () => {
      if (restaurantDebounceRef.current) clearTimeout(restaurantDebounceRef.current);
    };
  }, [restaurantAddress]);

  async function handleFindByAddress(e: React.FormEvent) {
    e.preventDefault();
    setFindingByAddress(true);
    setFindByAddressError(null);
    try {
      const res = await fetch("/api/find-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: restaurantAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't find that business");
      setLeads((prev) => {
        const existingIds = new Set(prev.map((l) => l.placeId));
        const newOnes = (data.leads as Lead[]).filter((l) => !existingIds.has(l.placeId));
        return [...newOnes, ...prev];
      });
      setRestaurantAddress("");
      setShowRestaurantSuggestions(false);
    } catch (err: any) {
      setFindByAddressError(err.message);
    } finally {
      setFindingByAddress(false);
    }
  }

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
          ...(categoryGroup ? { categories: categoryGroup.items } : { category }),
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

  const priorityStyle: Record<Lead["priority"], string> = darkMode
    ? {
        high: "bg-red-950 border-red-700 text-red-300",
        medium: "bg-[#2a2308] border-[#fdc700] text-[#fdc700]",
        low: "bg-slate-800 border-slate-600 text-slate-400",
      }
    : {
        high: "bg-red-50 border-red-300 text-red-700",
        medium: "bg-[#fffbea] border-[#fdc700] text-[#8a6d00]",
        low: "bg-slate-50 border-slate-300 text-slate-500",
      };

  return (
    <main className={`min-h-screen ${t.page}`}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight uppercase ${t.heading}`}>
              Business Website Generator
            </h1>
            <p className={`mt-1 ${t.subtext}`}>
              Find local businesses near an address and see which ones need a better website.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-lg border ${t.secondaryBtn}`}
          >
            {darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </header>

        <form
          onSubmit={handleSearch}
          className={`border rounded-xl shadow-sm p-6 mb-8 ${t.card}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${t.label}`}>
                Category
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_GROUPS.map((g) => {
                  const active = categoryGroup?.group === g.group;
                  return (
                    <button
                      key={g.group}
                      type="button"
                      onClick={() => {
                        setCategoryGroup(g);
                        setCategory(g.group);
                        setShowCategoryList(false);
                      }}
                      title={g.items.join(", ")}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${
                        active
                          ? "bg-blue-600 border-blue-600 text-white"
                          : `${t.input} hover:border-blue-400`
                      }`}
                    >
                      {g.emoji} {g.group}
                    </button>
                  );
                })}
              </div>

              <div className="flex">
                <input
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCategoryGroup(null);
                    setShowCategoryList(true);
                  }}
                  onFocus={() => setShowCategoryList(true)}
                  onBlur={() => setTimeout(() => setShowCategoryList(false), 150)}
                  placeholder="e.g. Restaurants, Plumbers..."
                  autoComplete="off"
                  className={`w-full border rounded-l-lg px-3 py-2 text-sm focus:outline-none ${t.input}`}
                />
                {category && (
                  <button
                    type="button"
                    onMouseDown={() => {
                      setCategory("");
                      setCategoryGroup(null);
                      setShowCategoryList(true);
                    }}
                    className={`border border-l-0 px-2 text-sm ${t.input}`}
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onMouseDown={() => setShowCategoryList((prev) => !prev)}
                  className={`border border-l-0 rounded-r-lg px-3 text-xs ${t.input}`}
                  title="Show all categories"
                >
                  ▼
                </button>
              </div>
              {categoryGroup && (
                <p className={`text-[11px] mt-1 ${t.dropdownMuted}`}>
                  Searching {categoryGroup.items.join(", ")} together.
                </p>
              )}
              {showCategoryList && (
                <ul className={`absolute z-10 left-0 right-0 mt-1 border rounded-lg shadow-md max-h-56 overflow-y-auto ${t.dropdown}`}>
                  {category.trim()
                    ? CATEGORIES.filter((c) => c.toLowerCase().includes(category.toLowerCase())).map((c) => (
                        <li key={c}>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setCategory(c);
                              setCategoryGroup(null);
                              setShowCategoryList(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm ${t.dropdownItem}`}
                          >
                            {c}
                          </button>
                        </li>
                      ))
                    : CATEGORY_GROUPS.map((g) => (
                        <li key={g.group}>
                          <div className={`px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide ${t.dropdownMuted}`}>
                            {g.group}
                          </div>
                          <ul>
                            {g.items.map((c) => (
                              <li key={c}>
                                <button
                                  type="button"
                                  onMouseDown={() => {
                                    setCategory(c);
                                    setCategoryGroup(null);
                                    setShowCategoryList(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm ${t.dropdownItem}`}
                                >
                                  {c}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                  {category.trim() &&
                    !CATEGORIES.some((c) => c.toLowerCase().includes(category.toLowerCase())) && (
                      <li className={`px-3 py-2 text-xs ${t.dropdownMuted}`}>
                        No matches — you can still search "{category}" as a custom category.
                      </li>
                    )}
                </ul>
              )}
            </div>

            <div className="relative">
              <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${t.label}`}>
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
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${t.input}`}
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul className={`absolute z-10 left-0 right-0 mt-1 border rounded-lg shadow-md max-h-56 overflow-y-auto ${t.dropdown}`}>
                  {addressSuggestions.map((s) => (
                    <li key={s.placeId}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setAddress(s.text);
                          setAddressSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm ${t.dropdownItem}`}
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
              <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${t.label}`}>
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${t.input}`}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${t.label}`}>
                Search radius
              </label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${t.input}`}
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${t.label}`}>
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
            <label className={`flex items-center gap-2 text-sm ${t.checkboxText}`}>
              <input
                type="checkbox"
                checked={includeNoWebsite}
                onChange={(e) => setIncludeNoWebsite(e.target.checked)}
                className="accent-blue-600"
              />
              Businesses without websites
            </label>
            <label className={`flex items-center gap-2 text-sm ${t.checkboxText}`}>
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
          <p className={`text-xs mt-2 ${t.helperText}`}>
            By default this searches businesses without a website only — check "outdated websites" above to include those too. Fetches up to 100 results within the chosen radius (using a few overlapping sub-searches), sorted by priority.
          </p>
        </form>

        <form
          onSubmit={handleFindByAddress}
          className={`border rounded-xl shadow-sm p-6 mb-8 ${t.card}`}
        >
          <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${t.label}`}>
            Restaurant Address
          </label>
          <p className={`text-xs mb-3 ${t.helperText}`}>
            Already know the specific business you want? Type its exact address (business name +
            address works best) to look it up directly, instead of running a broader search.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                value={restaurantAddress}
                onChange={(e) => {
                  setRestaurantAddress(e.target.value);
                  setShowRestaurantSuggestions(true);
                }}
                onFocus={() => setShowRestaurantSuggestions(true)}
                onBlur={() => setTimeout(() => setShowRestaurantSuggestions(false), 150)}
                placeholder="e.g. Joe's Pizza, 142 Rue Saint-Paul, Montreal, QC"
                required
                autoComplete="off"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${t.input}`}
              />
              {showRestaurantSuggestions && restaurantAddressSuggestions.length > 0 && (
                <ul className={`absolute z-10 left-0 right-0 mt-1 border rounded-lg shadow-md max-h-56 overflow-y-auto ${t.dropdown}`}>
                  {restaurantAddressSuggestions.map((s) => (
                    <li key={s.placeId}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setRestaurantAddress(s.text);
                          setRestaurantAddressSuggestions([]);
                          setShowRestaurantSuggestions(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm ${t.dropdownItem}`}
                      >
                        {s.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={findingByAddress}
              className="bg-green-600 text-white text-sm font-bold uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-green-500 disabled:opacity-50 whitespace-nowrap"
            >
              {findingByAddress ? "Finding…" : "Find Business"}
            </button>
          </div>
          {findByAddressError && (
            <p className={`text-xs mt-2 ${darkMode ? "text-red-400" : "text-red-600"}`}>{findByAddressError}</p>
          )}
        </form>

        {error && (
          <div className={`text-sm rounded-lg px-4 py-3 mb-6 ${darkMode ? "bg-red-950 border border-red-800 text-red-300" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div className={`border rounded-xl shadow-sm overflow-hidden ${t.card}`}>
            <div className={`px-6 py-4 border-b text-sm uppercase tracking-wide ${t.resultsHeaderBorder} ${t.resultsHeaderText}`}>
              {leads.length} result{leads.length !== 1 ? "s" : ""}
            </div>
            <ul className={`divide-y ${t.divide}`}>
              {leads.map((lead) => (
                <li key={lead.placeId} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold ${t.leadName}`}>{lead.name}</span>
                        <span
                          className={`text-xs border rounded-full px-2 py-0.5 uppercase tracking-wide ${priorityStyle[lead.priority]}`}
                        >
                          {lead.priority} priority
                        </span>
                        {lead.rating && (
                          <span className="text-xs flex items-center gap-0.5">
                            <span className="text-yellow-400">
                              {"★".repeat(Math.round(lead.rating))}
                              <span className={darkMode ? "text-slate-700" : "text-slate-200"}>
                                {"★".repeat(5 - Math.round(lead.rating))}
                              </span>
                            </span>
                            <span className={`ml-1 ${t.leadAddress}`}>
                              {lead.rating} ({lead.reviewCount})
                            </span>
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-0.5 truncate ${t.leadAddress}`}>
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
                          <a href={`tel:${lead.phone}`} className={`underline underline-offset-2 ${t.phoneLink}`}>
                            {lead.phone}
                          </a>
                        )}
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            className={`underline underline-offset-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                          >
                            Visit site ↗
                          </a>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        {lead.websiteScore.hasWebsite ? (
                          <>
                            <span className={`font-medium ${t.scoreText}`}>
                              Website score: {lead.websiteScore.score}/100
                            </span>
                            <button
                              onClick={() =>
                                setExpanded(expanded === lead.placeId ? null : lead.placeId)
                              }
                              className={`underline underline-offset-2 ${t.showDetails}`}
                            >
                              {expanded === lead.placeId ? "Hide details" : "Show details"}
                            </button>
                          </>
                        ) : (
                          <span className={darkMode ? "text-red-400 font-bold" : "text-red-600 font-bold"}>No website</span>
                        )}
                      </div>
                      {expanded === lead.placeId && lead.websiteScore.hasWebsite && (
                        <div className={`mt-3 border rounded-lg p-3 text-sm ${t.expandedBox}`}>
                          <ul className="grid grid-cols-2 gap-1 mb-2">
                            {lead.websiteScore.checks.map((c) => (
                              <li key={c.label} className={c.passed ? t.checkPassed : t.checkFailed}>
                                {c.passed ? "✓" : "✕"} {c.label}
                              </li>
                            ))}
                          </ul>
                          {lead.websiteScore.suggestions.length > 0 && (
                            <>
                              <p className={`font-bold mt-2 mb-1 ${t.improveHeading}`}>Needs improvement:</p>
                              <ul className={`list-disc list-inside ${t.improveList}`}>
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
                                className={`w-1/2 h-28 object-cover rounded-lg border ${t.thumbBorder}`}
                              />
                            ))}
                        </div>
                      )}
                      <label className={`text-[11px] border rounded-lg px-3 py-1.5 w-full text-center cursor-pointer ${t.secondaryBtn}`}>
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
                        <summary className={`text-[11px] border rounded-lg px-3 py-1.5 text-center cursor-pointer list-none ${t.secondaryBtn}`}>
                          {menuTexts[lead.placeId]?.trim() ? "Menu added ✓" : "Paste real menu (optional)"}
                        </summary>
                        <textarea
                          value={menuTexts[lead.placeId] ?? ""}
                          onChange={(e) =>
                            setMenuTexts((prev) => ({ ...prev, [lead.placeId]: e.target.value }))
                          }
                          placeholder={"## Starters\nCaesar Salad - $12\nSoup of the Day - $8\n\n## Mains\nGrilled Salmon - $24"}
                          rows={5}
                          className={`w-full mt-1.5 border rounded-lg text-[11px] px-2 py-1.5 focus:outline-none ${t.input}`}
                        />
                        <p className={`text-[10px] mt-1 ${t.helperText}`}>
                          One item per line: "Name - $Price". Use "## Category" for section headers.
                        </p>
                      </details>
                      <div className="w-full">
                        <label className={`text-[10px] block mb-1 ${t.helperText}`}>Website template</label>
                        <select
                          value={templateOverrides[lead.placeId] ?? ""}
                          onChange={(e) =>
                            setTemplateOverrides((prev) => ({ ...prev, [lead.placeId]: e.target.value }))
                          }
                          className={`w-full border rounded-lg text-[11px] px-2 py-1.5 focus:outline-none ${t.input}`}
                        >
                          <option value="">Auto (by category)</option>
                          <option value="restaurant-1">Restaurant — Style 1</option>
                          <option value="restaurant-2">Restaurant — Style 2</option>
                          <option value="restaurant-3">Restaurant — Style 3 (Fine Dining)</option>
                          <option value="coffee">Coffee Shop</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className={`text-[10px] block mb-1 ${t.helperText}`}>AI provider</label>
                        <select
                          value={providers[lead.placeId] ?? "groq"}
                          onChange={(e) =>
                            setProviders((prev) => ({ ...prev, [lead.placeId]: e.target.value as "groq" | "gemini" }))
                          }
                          className={`w-full border rounded-lg text-[11px] px-2 py-1.5 focus:outline-none ${t.input}`}
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
                          className={`text-xs font-bold border rounded-lg px-3 py-1.5 disabled:opacity-50 whitespace-nowrap w-full uppercase ${t.primaryOutlineBtn}`}
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
                            className={`w-full border rounded-lg text-[11px] px-2 py-1.5 focus:outline-none ${t.input}`}
                          />
                          <button
                            onClick={() => handleGenerate(lead, true)}
                            disabled={generating.has(lead.placeId) || !comments[lead.placeId]?.trim()}
                            className={`mt-1 text-[11px] font-bold border rounded-lg px-3 py-1 disabled:opacity-40 whitespace-nowrap w-full uppercase ${t.primaryOutlineBtn}`}
                          >
                            {generating.has(lead.placeId) ? "Regenerating…" : "Regenerate with feedback"}
                          </button>
                        </div>
                      )}
                      {genErrors[lead.placeId] && (
                        <p className={`text-xs text-right ${darkMode ? "text-red-400" : "text-red-600"}`}>{genErrors[lead.placeId]}</p>
                      )}
                      <button
                        onClick={() => handleSave(lead)}
                        disabled={savedIds.has(lead.placeId)}
                        className={`text-xs font-medium border rounded-lg px-3 py-1.5 disabled:opacity-50 whitespace-nowrap w-full ${t.secondaryBtn}`}
                      >
                        {savedIds.has(lead.placeId) ? "Saved ✓" : "Save to CRM"}
                      </button>
                      <a
                        href={lead.mapsUrl}
                        target="_blank"
                        className={`text-xs underline underline-offset-2 ${t.mapsLink}`}
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
