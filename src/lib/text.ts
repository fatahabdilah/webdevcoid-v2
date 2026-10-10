/**
 * Joins the last two words with a non-breaking space so a line never ends on a lone word.
 * Two-word texts are left alone so they can still wrap on narrow phones.
 */
export const noOrphan = (text: string) => (text.trim().split(/\s+/).length > 2 ? text.replace(/ (?=\S+$)/, "\u00A0") : text);
