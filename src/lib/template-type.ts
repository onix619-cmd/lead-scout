export type TemplateType = "restaurant" | "icecream" | "generic";

export function detectTemplateType(category: string): TemplateType {
  const c = category.toLowerCase();
  if (/ice cream|gelato|frozen yogurt|creamery/.test(c)) return "icecream";
  if (/restaurant|pizza|bakery|bar\b|bistro|diner|food|grill|kitchen|eatery|sushi|steakhouse|coffee|cafe|café|espresso/.test(c))
    return "restaurant";
  return "generic";
}
