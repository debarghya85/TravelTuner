"use client";

export const ITINERARY_STORAGE_KEY = "travel-tuner:last-itinerary";
const ITINERARY_LOCAL_STORAGE_KEY = "travel-tuner:last-itinerary:local";

export type TimelineItem = {
  time?: string;
  activity?: string;
};

export type ItineraryDay = {
  day?: string;
  title?: string;
  timeline?: TimelineItem[];
  activities?: string[];
  food?: string;
  foodOptions?: FoodOption[];
  stay?: string;
  localTransport?: LocalTransport[];
  estimatedDayCost?: number;
};

export type StayOption = {
  name?: string;
  type?: string;
  location?: string;
  roomCategory?: string;
  occupancy?: string;
  roomsRequired?: number;
  extraBed?: boolean;
  pricePerNight?: number;
  totalStayCost?: number;
  rating?: number;
  googleMapsLink?: string;
  amenities?: string[];
  recommendedFor?: string;
};

export type TravelOption = {
  mode?: string;
  provider?: string;
  name?: string;
  number?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  frequency?: string;
  class?: string;
  cost?: number;
  availableFor?: string;
  notes?: string;
};

export type LocalTransport = {
  day?: string;
  mode?: string;
  title?: string;
  details?: string;
  route?: string;
  duration?: string;
  dailyCost?: number;
  cost?: number;
};

export type FoodOption = {
  day?: string;
  type?: string;
  items?: string[];
  cost?: number;
};

export type Itinerary = {
  summary?: string;
  destination?: string;
  coverImageUrl?: string;
  bestTimeToVisit?: string;
  travelerInfo?: {
    adults?: number;
    children?: number;
    totalTravelers?: number;
    travelers?: number;
    pricingCalculatedFor?: string;
  };
  totalEstimatedCost?: number;
  costBreakdown?: {
    transport?: number;
    stay?: number;
    food?: number;
    activities?: number;
  };
  travelOptions?: {
    toDestination?: TravelOption[];
    returnOptions?: TravelOption[];
    localTransport?: LocalTransport[];
    dayTransport?: LocalTransport[];
  };
  stayOptions?: StayOption[];
  foodOptions?: FoodOption[];
  days?: ItineraryDay[];
  tips?: string[];
};

export function normalizeItinerary(payload: unknown): Itinerary | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const wrapped = payload as { itinerary?: Itinerary };
  return wrapped.itinerary || (payload as Itinerary);
}

export function saveItinerary(payload: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(payload));
  window.localStorage.setItem(ITINERARY_LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

export function readItinerary(): Itinerary | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    window.sessionStorage.getItem(ITINERARY_STORAGE_KEY) ||
    window.localStorage.getItem(ITINERARY_LOCAL_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeItinerary(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function formatMoney(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function travelerTotal(itinerary: Itinerary) {
  const info = itinerary.travelerInfo || {};
  return info.totalTravelers || info.travelers || Number(info.adults || 0) + Number(info.children || 0);
}

export function dayTitle(day: ItineraryDay, index: number) {
  return `${day.day || `Day ${index + 1}`} - ${day.title || "Planned Day"}`;
}

function extractDayNumber(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().trim();
  const exactNumber = normalized.match(/^(\d+)$/);
  if (exactNumber) {
    return Number(exactNumber[1]);
  }

  const dayNumber = normalized.match(/\bday\s*(\d+)\b/);
  return dayNumber ? Number(dayNumber[1]) : null;
}

export function matchesDayLabel(value: string | undefined, day: number) {
  return extractDayNumber(value) === day;
}

export function uniqueLocalTransport<T extends { day?: string; mode?: string; title?: string; route?: string; details?: string; duration?: string; cost?: number; dailyCost?: number }>(
  options: T[],
) {
  const seen = new Set<string>();

  return options.filter((option) => {
    const signature = [
      option.day || "",
      option.mode || "",
      option.title || "",
      option.route || "",
      option.details || "",
      option.duration || "",
      option.cost ?? option.dailyCost ?? "",
    ].join("|");

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
}
