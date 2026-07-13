export type PlanTier = "silver" | "gold";

export function normalizePlanTier(value?: string | null): PlanTier {
  if (!value) {
    return "silver";
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === "gold" ? "gold" : "silver";
}

export function getPlanDisplayName(value?: string | null) {
  return normalizePlanTier(value) === "gold" ? "Gold" : "Silver";
}
