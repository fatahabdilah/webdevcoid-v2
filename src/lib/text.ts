/** Joins the last two words with a non-breaking space so a line never ends on a lone word. */
export const noOrphan = (text: string) => text.replace(/ (?=\S+$)/, "\u00A0");
