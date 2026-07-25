export type Business = {
  placeId: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number;
  openingHours: string[];
  mapsUrl: string;
  photoUrl: string | null;
};

export type WebsiteScore = {
  score: number; // 0-100
  hasWebsite: boolean;
  checks: {
    label: string;
    passed: boolean;
    weight: number;
  }[];
  suggestions: string[];
  socialLinks?: { instagram?: string; facebook?: string };
  error?: string;
};

export type Lead = Business & {
  websiteScore: WebsiteScore;
  priority: "high" | "medium" | "low";
  socialLinks?: { instagram?: string; facebook?: string };
};

export type GeneratedContent = {
  tagline: string;
  aboutUs: string;
  seoTitle: string;
  metaDescription: string;
  highlights: string[]; // 3-4 short selling points (menu items or services)
  faq: { question: string; answer: string }[];
  googleBusinessDescription: string;
};
