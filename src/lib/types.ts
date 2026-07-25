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
  error?: string;
};

export type Lead = Business & {
  websiteScore: WebsiteScore;
  priority: "high" | "medium" | "low";
};
