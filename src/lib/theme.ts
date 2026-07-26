export type ThemeKey = "restaurant" | "coffee" | "icecream" | "generic";

export type Theme = {
  key: ThemeKey;
  googleFontsUrl: string;
  fontHeading: string;
  fontBody: string;
  primary: string;
  accent: string;
  dark: string;
  text: string;
  radius: string; // tailwind-ish radius token used inline
  playful: boolean;
  labels: {
    featured: string; // "Signature Dishes" / "Featured Drinks" / "Our Flavors"
    reserveCta: string; // "Reserve a Table" / "Order Online" / "Order Now"
    menu: string; // nav label
  };
};

const RESTAURANT_PALETTES = [
  { primary: "#c9a24b", accent: "#1a1613", dark: "#0d0c0a", text: "#f5efe3" },
];

function paletteFor(name: string, palettes: typeof RESTAURANT_PALETTES) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}

export function detectThemeKey(category: string, name: string): ThemeKey {
  const s = `${category} ${name}`.toLowerCase();
  if (/ice cream|gelato|frozen yogurt|creamery|glacier/.test(s)) return "icecream";
  if (/coffee|cafe|café|espresso|roaster/.test(s)) return "coffee";
  if (/restaurant|bistro|pizza|steakhouse|sushi|diner|eatery|grill|bar\b|brasserie|trattoria|BBQ|noodle|ramen|taqueria/.test(s))
    return "restaurant";
  return "generic";
}

export function getTheme(key: ThemeKey, businessName: string): Theme {
  switch (key) {
    case "restaurant": {
      const p = paletteFor(businessName, RESTAURANT_PALETTES);
      return {
        key,
        googleFontsUrl:
          "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600&display=swap",
        fontHeading: "'Playfair Display', serif",
        fontBody: "'Inter', sans-serif",
        primary: p.primary,
        accent: p.accent,
        dark: p.dark,
        text: p.text,
        radius: "1rem",
        playful: false,
        labels: { featured: "Signature Dishes", reserveCta: "Reserve a Table", menu: "Menu" },
      };
    }
    case "coffee":
      return {
        key,
        googleFontsUrl:
          "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=Poppins:wght@400;500;600&display=swap",
        fontHeading: "'Fraunces', serif",
        fontBody: "'Poppins', sans-serif",
        primary: "#6f4e37",
        accent: "#f3e6d3",
        dark: "#241c15",
        text: "#f6f0e6",
        radius: "1.25rem",
        playful: false,
        labels: { featured: "Featured Drinks", reserveCta: "Order Online", menu: "Menu" },
      };
    case "icecream":
      return {
        key,
        googleFontsUrl:
          "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;700&display=swap",
        fontHeading: "'Baloo 2', cursive",
        fontBody: "'Nunito', sans-serif",
        primary: "#ff6f91",
        accent: "#ffe3ec",
        dark: "#3a2e39",
        text: "#fff7f9",
        radius: "2rem",
        playful: true,
        labels: { featured: "Our Flavors", reserveCta: "Order Now", menu: "Flavors" },
      };
    default: {
      const p = paletteFor(businessName, RESTAURANT_PALETTES);
      return {
        key: "generic",
        googleFontsUrl: "",
        fontHeading: "-apple-system, sans-serif",
        fontBody: "-apple-system, sans-serif",
        primary: p.primary,
        accent: p.accent,
        dark: "#111111",
        text: "#f5f5f5",
        radius: "0.75rem",
        playful: false,
        labels: { featured: "What We Offer", reserveCta: "Book Now", menu: "Services" },
      };
    }
  }
}
