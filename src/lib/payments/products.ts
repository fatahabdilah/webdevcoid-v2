/** What /testing sells: one fixed product. The price lives here, on the server side, never in the browser's request. */
export const TEST_PRODUCT = { id: "TEST-01", name: "Pembayaran uji webdev.co.id", price: 10_000 };

export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
