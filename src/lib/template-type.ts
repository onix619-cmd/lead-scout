export type TemplateType = "restaurant" | "quickservice" | "coffee" | "icecream" | "generic";

export function detectTemplateType(category: string): TemplateType {
  const c = category.toLowerCase();
  if (/ice cream|gelato|frozen yogurt|creamery/.test(c)) return "icecream";
  if (/coffee|cafe|café|espresso|roaster/.test(c)) return "coffee";
  if (/pizza|burger|fast food|hot dog|taco|BBQ|barbecue|food truck|diner|drive-?in/.test(c))
    return "quickservice";
  if (/restaurant|bakery|bar\b|bistro|food|grill|kitchen|eatery|sushi|steakhouse/.test(c))
    return "restaurant";
  return "generic";
}
