"use client";

import { jsPDF } from "jspdf";
import { formatMoney, type Itinerary, type LocalTransport, travelerTotal } from "./itinerary-data";

type Cursor = { y: number; page: number };
type Color = [number, number, number];

const W = 210;
const H = 297;
const MX = 14;
const MT = 14;
const MB = 14;
const CW = W - MX * 2;

const COLORS = {
  ink: [15, 23, 42] as Color,
  muted: [86, 102, 128] as Color,
  line: [215, 226, 247] as Color,
  panel: [251, 253, 255] as Color,
  panelSoft: [243, 248, 255] as Color,
  brand: [37, 99, 235] as Color,
  green: [19, 166, 92] as Color,
  amber: [245, 158, 11] as Color,
  pink: [236, 72, 153] as Color,
  violet: [124, 58, 237] as Color,
};

function text(doc: jsPDF, x: number, y: number, value: string, size = 10, color = COLORS.ink, bold = false) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(value, x, y);
}

function pageHeader(doc: jsPDF, itinerary: Itinerary, page: number) {
  doc.setFillColor(246, 250, 255);
  doc.roundedRect(MX, 8, CW, 22, 4, 4, "F");
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(MX, 8, CW, 22, 4, 4, "S");

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MX + 5, 11, 14, 14, 4, 4, "F");
  text(doc, MX + 7, 20.2, "TT", 9.5, COLORS.brand, true);

  text(doc, MX + 24, 17, itinerary.destination || "Travel Plan", 14, COLORS.ink, true);
  text(doc, MX + 24, 22.2, "Complete itinerary summary", 8.3, COLORS.muted, false);

  doc.setFillColor(227, 237, 255);
  doc.roundedRect(W - MX - 42, 13, 34, 10, 5, 5, "F");
  text(doc, W - MX - 25, 19.5, `P${page}`, 8.5, COLORS.brand, true);
}

function pageFooter(doc: jsPDF, page: number) {
  doc.setDrawColor(...COLORS.line);
  doc.line(MX, H - 10, W - MX, H - 10);
  text(doc, MX, H - 4.2, "Travel Tuner", 7.5, COLORS.muted, true);
  text(doc, W - MX, H - 4.2, String(page), 7.5, COLORS.muted, true);
}

function ensure(doc: jsPDF, itinerary: Itinerary, cursor: Cursor, need = 12) {
  if (cursor.y + need <= H - MB) return;
  pageFooter(doc, cursor.page);
  doc.addPage();
  cursor.page += 1;
  cursor.y = 14;
  pageHeader(doc, itinerary, cursor.page);
}

function titleRule(doc: jsPDF, itinerary: Itinerary, title: string, cursor: Cursor) {
  ensure(doc, itinerary, cursor, 14);
  text(doc, MX, cursor.y, title, 11.3, COLORS.ink, true);
  doc.setDrawColor(...COLORS.line);
  doc.line(MX, cursor.y + 2.5, W - MX, cursor.y + 2.5);
  cursor.y += 7;
}

function wrapLines(doc: jsPDF, lines: string[], width: number) {
  return lines.flatMap((line) => doc.splitTextToSize(line, width));
}

function card(
  doc: jsPDF,
  itinerary: Itinerary,
  cursor: Cursor,
  title: string,
  lines: string[],
  accent: Color = COLORS.brand,
  width = CW,
) {
  const content = wrapLines(doc, lines.filter(Boolean), width - 10);
  const height = 9 + content.length * 4.15;
  ensure(doc, itinerary, cursor, height + 4);

  doc.setFillColor(...COLORS.panel);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(MX, cursor.y, width, height, 5, 5, "FD");
  doc.setFillColor(...accent);
  doc.roundedRect(MX + 2, cursor.y + 2, 2.2, height - 4, 1.1, 1.1, "F");

  text(doc, MX + 8, cursor.y + 6.8, title, 10.8, COLORS.ink, true);
  if (content.length) {
    doc.setTextColor(73, 86, 108);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(content, MX + 8, cursor.y + 12);
  }
  cursor.y += height + 5;
}

function statCard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string) {
  doc.setFillColor(...COLORS.panelSoft);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(x, y, w, 18, 4, 4, "FD");
  text(doc, x + 4, y + 6, label, 7.2, COLORS.muted, true);
  text(doc, x + 4, y + 12.2, value, 11, COLORS.ink, true);
}

function firstPage(doc: jsPDF, itinerary: Itinerary, cursor: Cursor) {
  const leftW = 102;
  const rightW = CW - leftW - 8;
  const heroY = 34;
  const heroH = 66;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(MX, heroY, leftW, heroH, 6, 6, "FD");
  doc.roundedRect(MX + leftW + 8, heroY, rightW, heroH, 6, 6, "FD");

  text(doc, MX + 8, heroY + 11, itinerary.destination || "Your Trip", 21, COLORS.ink, true);
  const summary = wrapLines(doc, [itinerary.summary || ""], leftW - 16);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.2);
  doc.text(summary, MX + 8, heroY + 21);

  const statsTop = heroY + 8;
  const statW = (rightW - 8) / 2;
  statCard(doc, MX + leftW + 14, statsTop, statW, "DAYS", String(itinerary.days?.length || 0));
  statCard(doc, MX + leftW + 14 + statW + 8, statsTop, statW, "TRAVELERS", String(travelerTotal(itinerary)));
  statCard(doc, MX + leftW + 14, statsTop + 22, statW, "TOTAL BUDGET", formatMoney(itinerary.totalEstimatedCost));
  statCard(doc, MX + leftW + 14 + statW + 8, statsTop + 22, statW, "BEST TIME", itinerary.bestTimeToVisit || "Planned");
  statCard(doc, MX + leftW + 14, statsTop + 44, rightW - 10, "DESTINATION", itinerary.destination || "-");

  cursor.y = heroY + heroH + 8;

  titleRule(doc, itinerary, "Trip Overview", cursor);
  const overviewLines = [
    `Traveler group: ${travelerTotal(itinerary)} people`,
    `Budget range: ${formatMoney(itinerary.totalEstimatedCost)}`,
    `Planning window: ${itinerary.bestTimeToVisit || "Planned"}`,
  ];
  card(doc, itinerary, cursor, "Summary", overviewLines, COLORS.brand, leftW);
  card(
    doc,
    itinerary,
    cursor,
    "Traveler Information",
    [
      `Adults: ${itinerary.travelerInfo?.adults || 0}`,
      `Children: ${itinerary.travelerInfo?.children || 0}`,
    ],
    COLORS.green,
    rightW,
  );

  titleRule(doc, itinerary, "Budget Snapshot", cursor);
  card(
    doc,
    itinerary,
    cursor,
    "Budget Breakdown",
    [
      `Total: ${formatMoney(itinerary.totalEstimatedCost)}`,
      `Transport: ${formatMoney(itinerary.costBreakdown?.transport)}`,
      `Stay: ${formatMoney(itinerary.costBreakdown?.stay)}`,
      `Food: ${formatMoney(itinerary.costBreakdown?.food)}`,
      `Activities: ${formatMoney(itinerary.costBreakdown?.activities)}`,
    ],
    COLORS.amber,
  );
}

function dayCards(doc: jsPDF, itinerary: Itinerary, cursor: Cursor) {
  titleRule(doc, itinerary, "Day-by-Day Itinerary", cursor);
  (itinerary.days || []).forEach((day, index) => {
    const lines = [
      day.title || "Planned day",
      ...(day.timeline || []).map((item) => `${item.time || ""}  ${item.activity || ""}`.trim()),
      ...(day.activities || []),
      day.food ? `Meals: ${day.food}` : "",
      day.stay ? `Stay: ${day.stay}` : "",
    ].filter(Boolean);
    card(doc, itinerary, cursor, day.day || `Day ${index + 1}`, lines, index % 2 ? COLORS.pink : COLORS.brand);
  });
}

function optionCards(
  doc: jsPDF,
  itinerary: Itinerary,
  cursor: Cursor,
  title: string,
  items: Array<{ title: string; lines: string[]; accent?: Color }>,
) {
  if (!items.length) return;
  titleRule(doc, itinerary, title, cursor);
  items.forEach((item) => card(doc, itinerary, cursor, item.title, item.lines, item.accent || COLORS.brand));
}

function splitPairs<T>(items: T[]) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 2) out.push(items.slice(i, i + 2));
  return out;
}

function sectionGrid(
  doc: jsPDF,
  itinerary: Itinerary,
  cursor: Cursor,
  title: string,
  cards: { title: string; lines: string[]; accent?: Color }[],
) {
  if (!cards.length) return;
  titleRule(doc, itinerary, title, cursor);
  splitPairs(cards).forEach((pair) => {
    if (pair.length === 1) {
      card(doc, itinerary, cursor, pair[0].title, pair[0].lines, pair[0].accent || COLORS.brand);
      return;
    }
    const leftW = (CW - 6) / 2;
    const rightW = leftW;
    const leftText = wrapLines(doc, pair[0].lines.filter(Boolean), leftW - 10);
    const rightText = wrapLines(doc, pair[1].lines.filter(Boolean), rightW - 10);
    const h = Math.max(9 + leftText.length * 4.15, 9 + rightText.length * 4.15);
    ensure(doc, itinerary, cursor, h + 4);

    [0, 1].forEach((idx) => {
      const item = pair[idx];
      const x = idx === 0 ? MX : MX + leftW + 6;
      const w = idx === 0 ? leftW : rightW;
      const content = wrapLines(doc, item.lines.filter(Boolean), w - 10);
      doc.setFillColor(...COLORS.panel);
      doc.setDrawColor(...COLORS.line);
      doc.roundedRect(x, cursor.y, w, h, 5, 5, "FD");
      doc.setFillColor(...(item.accent || COLORS.brand));
      doc.roundedRect(x + 2, cursor.y + 2, 2.2, h - 4, 1.1, 1.1, "F");
      text(doc, x + 8, cursor.y + 6.8, item.title, 10.4, COLORS.ink, true);
      doc.setTextColor(73, 86, 108);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.9);
      if (content.length) doc.text(content, x + 8, cursor.y + 12);
    });
    cursor.y += h + 5;
  });
}

export function downloadItineraryPdf(itinerary: Itinerary) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor: Cursor = { y: 14, page: 1 };

  pageHeader(doc, itinerary, 1);
  firstPage(doc, itinerary, cursor);

  dayCards(doc, itinerary, cursor);

  const travelOptions = [
    ...(itinerary.travelOptions?.toDestination || []),
    ...(itinerary.travelOptions?.returnOptions || []),
  ];
  sectionGrid(
    doc,
    itinerary,
    cursor,
    "Travel Options",
    travelOptions.map((travel, index) => ({
      title: travel.name || travel.mode || `Travel ${index + 1}`,
      lines: [
        `${travel.from || ""} to ${travel.to || ""}`.trim(),
        travel.departureTime || travel.duration || "Scheduled",
        travel.class || "Standard",
        formatMoney(travel.cost),
      ],
      accent: COLORS.brand,
    })),
  );

  const localTransport = [
    ...(itinerary.travelOptions?.dayTransport || []),
    ...(itinerary.travelOptions?.localTransport || []),
  ];
  sectionGrid(
    doc,
    itinerary,
    cursor,
    "Local Transport",
    localTransport.map((option: LocalTransport, index) => ({
      title: option.title || option.mode || `Local ${index + 1}`,
      lines: [option.details || option.route || "Local transfers and sightseeing transport.", formatMoney(option.cost || option.dailyCost)],
      accent: COLORS.green,
    })),
  );

  sectionGrid(
    doc,
    itinerary,
    cursor,
    "Stay Options",
    (itinerary.stayOptions || []).map((stay, index) => ({
      title: stay.name || `Stay ${index + 1}`,
      lines: [
        stay.location || "Location not specified",
        stay.type ? `${stay.type}` : "",
        stay.rating ? `Rating: ${stay.rating}` : "",
        stay.occupancy ? `Occupancy: ${stay.occupancy}` : "",
        formatMoney(stay.pricePerNight) ? `${formatMoney(stay.pricePerNight)}/night` : "",
      ].filter(Boolean),
      accent: COLORS.violet,
    })),
  );

  const foodCards = [
    ...(itinerary.days || [])
      .filter((day) => day.food || day.foodOptions?.length)
      .map((day, index) => ({
        title: `${day.day || `Day ${index + 1}`} Meals`,
        lines: [
          day.food || "",
          ...(day.foodOptions || []).map((food) => `${food.type || "Meal"}: ${(food.items || []).join(", ")}`),
        ].filter(Boolean),
        accent: COLORS.pink,
      })),
    ...(itinerary.foodOptions || []).map((food, index) => ({
      title: food.day || `Meal Plan ${index + 1}`,
      lines: [`${food.type || "Meal"}${food.cost ? ` | ${formatMoney(food.cost)}` : ""}`, ...(food.items || [])].filter(Boolean),
      accent: COLORS.pink,
    })),
  ];
  sectionGrid(doc, itinerary, cursor, "Food & Tips", foodCards);

  card(
    doc,
    itinerary,
    cursor,
    "Tips",
    (itinerary.tips?.length ? itinerary.tips : ["Keep buffer time between activities."]).map((tip) => `- ${tip}`),
    COLORS.amber,
  );

  pageFooter(doc, cursor.page);
  doc.save(`${(itinerary.destination || "itinerary").replace(/[^\w\-]+/g, "-")}.pdf`);
}
