"use client";

import { useState } from "react";
import { Lead } from "@/lib/types";

const CATEGORIES = [
  "Restaurants",
  "Coffee shops",
  "Pizza",
  "Interior designers",
  "Hair salons",
  "Bakeries",
  "Gyms",
];

const priorityStyle: Record<Lead["priority"], string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-500 border-slate-200",
};

export default function Dashboard() {
  const [category, setCategory] = useState("Restaurants");
  const [city, setCity] = useState("Montreal");
  const [minRating, setMinRating] = useState(4);
  const [includeNoWebsite, setIncludeNoWebsite] = useState(true);
  const [includeOutdated, setIncludeOutdated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLeads([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, city, minRating, includeNoWebsite, includeOutdated }),
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Lead Scout</h1>
          <p className="text-slate-500 mt-1">
            Find local businesses and see which ones need a better website.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Montreal"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Minimum rating: {minRating}★
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeNoWebsite}
                onChange={(e) => setIncludeNoWebsite(e.target.checked)}
              />
              Businesses without websites
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeOutdated}
                onChange={(e) => setIncludeOutdated(e.target.checked)}
              />
              Businesses with outdated websites
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 text-sm text-slate-500">
              {leads.length} result{leads.length !== 1 ? "s" : ""}
            </div>
            <ul className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <li key={lead.placeId} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{lead.name}</span>
                        <span
                          className={`text-xs border rounded-full px-2 py-0.5 ${priorityStyle[lead.priority]}`}
                        >
                          {lead.priority} priority
                        </span>
                        {lead.rating && (
                          <span className="text-xs text-slate-500">
                            {lead.rating}★ ({lead.reviewCount})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        {lead.address}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        {lead.websiteScore.hasWebsite ? (
                          <>
                            <span className="font-medium">
                              Website score: {lead.websiteScore.score}/100
                            </span>
                            <button
                              onClick={() =>
                                setExpanded(expanded === lead.placeId ? null : lead.placeId)
                              }
                              className="text-slate-500 underline underline-offset-2"
                            >
                              {expanded === lead.placeId ? "Hide details" : "Show details"}
                            </button>
                          </>
                        ) : (
                          <span className="text-red-600 font-medium">No website</span>
                        )}
                      </div>
                      {expanded === lead.placeId && lead.websiteScore.hasWebsite && (
                        <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm">
                          <ul className="grid grid-cols-2 gap-1 mb-2">
                            {lead.websiteScore.checks.map((c) => (
                              <li key={c.label} className={c.passed ? "text-slate-600" : "text-slate-400"}>
                                {c.passed ? "✓" : "✕"} {c.label}
                              </li>
                            ))}
                          </ul>
                          {lead.websiteScore.suggestions.length > 0 && (
                            <>
                              <p className="font-medium mt-2 mb-1">Needs improvement:</p>
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
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => handleSave(lead)}
                        disabled={savedIds.has(lead.placeId)}
                        className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
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
