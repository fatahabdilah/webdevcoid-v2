/** The light card surface shared by the Layanan card and the cards around it. Large section cards are 24px round
 *  (rounded-3xl) across the page; cards inside them 16px; chips and small marks 12px. */
export const bentoCard = "rounded-3xl border border-grey-07 bg-grey-09 shadow-[var(--shadow-card)]";

/** The Layanan cards' words, set like the cards in the other sections (Harga, the consultation cards): a t-title-m
 *  title 8px above a t-body-m line (the owner, 2026-10-24: this section follows the others). Cards keep their words
 *  40px from the left edge on desktop, like the consultation card. */
export const cardTitle = "t-title-m text-balance";
export const cardWords = "flex flex-col gap-2";
