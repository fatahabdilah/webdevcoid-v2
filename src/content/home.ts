/**
 * Home page copy for webdev.co.id (Brand Guidelines v1.8): "kamu/kami", no "paket",
 * no technology names, no testimonials or fictional numbers. Prices and inclusions
 * come from webdev.co.id.
 */

/*
 * Copy that sits side by side (cards in a row) is kept to matching lengths, so siblings wrap to the same
 * number of lines; "\n" marks a fixed line break where the break itself must match (see components/Lines).
 */

/** "Kenapa kami", value proposition (2.3, 2.4). `short` labels the value's node in the diagram;
 * `keywords` float round the emblem while the value is open. */
export const values = [
  {
    number: "01",
    short: "Desain custom",
    keywords: ["Dari nol", "Sesuai brand", "Harga jelas"],
    title: "Desain custom,\nharga masuk akal",
    text: "Dibuat dari nol untuk bisnismu, bukan dari template jadi.",
    icon: "custom",
  },
  {
    number: "02",
    short: "Kualitas premium",
    keywords: ["Satu tim", "Konten disusun", "Preview tiap tahap"],
    title: "Kualitas premium,\nproses tanpa ribet",
    text: "Satu tim mengurus desain, konten, sampai website tayang.",
    icon: "premium",
  },
  {
    number: "03",
    short: "Cepat dibuka",
    keywords: ["Ringan di HP", "SEO", "Mudah dicari"],
    title: "Cepat dibuka,\nbantu bisnis tumbuh",
    text: "Ringan di HP, mudah dicari, dan menarik calon pelanggan.",
    icon: "fast",
  },
];

/**
 * The services, as the Layanan bento (components/home/ServiceBento.tsx), on the owner's grid "1 1 2 / 3 4 4 / 5 6 6"
 * (5 and 6 are the consultation and "Sudah termasuk" cards in Services.tsx): `wide` cards take two of the three
 * columns. Every card reads label, big title, one line. Each has its visual in ServiceBento.tsx.
 */
export type Service = { key: "custom" | "landing" | "company" | "existing"; label: string; title: string; text: string; wide?: boolean };

export const services: Service[] = [
  { key: "custom", label: "Toko online & sistem", title: "Custom", text: "Toko online, dashboard, atau sistem yang dibuat sesuai kebutuhan bisnismu.", wide: true },
  { key: "landing", label: "Untuk promo & iklan", title: "Landing Page", text: "Satu halaman promo yang fokus mengubah pengunjung jadi pembeli." },
  { key: "company", label: "Profil usaha", title: "Company Profile", text: "Tampil kredibel dan mudah ditemukan saat calon pelanggan mencari di Google." },
  {
    key: "existing",
    label: "Redesign · Maintenance · Migrasi",
    title: "Redesign, maintenance & migrasi",
    text: "Sudah punya website? Kami perbarui tampilannya, pindahkan hostingnya tanpa ribet, lalu rawat tiap bulan.",
    wide: true,
  },
];

/** "Sudah termasuk di setiap harga" tiles. */
export const included = [
  { label: "Domain & hosting\ntahun pertama", icon: "domain" },
  { label: "Sertifikat SSL\nuntuk keamanan", icon: "ssl" },
  { label: "Responsif di\nsemua perangkat", icon: "responsive" },
  { label: "Dioptimasi SEO,\nmudah dicari", icon: "seo" },
] as const;

/**
 * "Cara kerja": four stages, shown as a flow across one card (I–IV) and spelled out in the grid under it.
 * `label` names the stage in the card; `lead` + `text` read as one sentence in the grid.
 */
export const stages = [
  {
    numeral: "I",
    label: "Konsultasi",
    lead: "Konsultasi gratis.",
    text: "Ceritakan bisnismu di WhatsApp, kami bantu pilih yang pas.",
    icon: "chat",
  },
  {
    numeral: "II",
    label: "Desain custom",
    lead: "Disusun dan didesain dari nol.",
    text: "Halaman dan isinya kami susun, tampilannya sesuai brand bisnismu.",
    icon: "pen",
  },
  {
    numeral: "III",
    label: "Preview & revisi",
    lead: "Preview di setiap tahap.",
    text: "Lihat hasilnya dan beri masukan sebelum website tayang.",
    icon: "eye",
  },
  {
    numeral: "IV",
    label: "Website tayang",
    lead: "Siap online.",
    text: "Domain, hosting, dan SSL kami pasang. Bisnismu siap dikunjungi.",
    icon: "rocket",
  },
] as const;

/** Big scrolling band in "Tentang kami". Words, not numbers. */
export const stats = [
  { value: "Custom", label: "bukan template" },
  { value: "Harga jelas", label: "dari awal" },
  { value: "Satu pintu", label: "kami urus semua" },
];

export type Plan = {
  name: string;
  /** Tile glyph at the top of the card: one page, a company building, or a dashboard. */
  icon: "page" | "building" | "dashboard";
  tagline: string;
  from: boolean;
  /** In thousands of rupiah, e.g. "1.490" → Rp1.490.000. Omit for plans quoted per project (see `quote`). */
  price?: string;
  /** Shown in place of a price, read as one phrase: small label above, big value below. */
  quote?: { label: string; value: string };
  features: { label: string; included: boolean }[];
  cta: string;
  renewal: string;
  featured: boolean;
  /** Top tier: its highlight is the dark, premium version of the gradient. */
  premium?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Landing Page",
    icon: "page",
    tagline: "Satu halaman fokus untuk promosi, produk, atau profil singkat.",
    from: false,
    price: "1.990",
    features: [
      { label: "1 halaman desain custom", included: true },
      { label: "Responsif semua perangkat", included: true },
      { label: "Form terhubung WhatsApp", included: true },
      { label: "SEO", included: true },
      { label: "Domain & hosting 1 tahun", included: true },
      { label: "Sertifikat SSL", included: true },
      { label: "Halaman tambahan", included: false },
      { label: "Admin panel / CMS", included: false },
    ],
    cta: "Mulai Sekarang",
    renewal: "Perpanjangan domain & hosting: Rp900.000/tahun mulai tahun ke-2",
    featured: false,
  },
  {
    name: "Company Profile",
    icon: "building",
    tagline: "Website lengkap untuk bisnis yang mau tampil profesional dan kredibel.",
    from: false,
    price: "3.990",
    features: [
      { label: "Sampai 6 halaman custom", included: true },
      { label: "Responsif semua perangkat", included: true },
      { label: "Form WhatsApp + email", included: true },
      { label: "SEO", included: true },
      { label: "Domain & hosting 1 tahun", included: true },
      { label: "Sertifikat SSL", included: true },
      { label: "Halaman tambahan (add-on)", included: true },
      { label: "Admin panel / CMS", included: false },
    ],
    cta: "Mulai Sekarang",
    renewal: "Perpanjangan domain & hosting: Rp1.800.000/tahun mulai tahun ke-2",
    featured: true,
  },
  {
    name: "Custom",
    icon: "dashboard",
    tagline: "Sistem, dashboard, atau toko online yang dibuat sesuai kebutuhan.",
    from: false,
    quote: { label: "dihitung setelah", value: "Konsultasi" },
    features: [
      { label: "Halaman & fitur sesuai kebutuhan", included: true },
      { label: "Responsif semua perangkat", included: true },
      { label: "Form & integrasi lengkap", included: true },
      { label: "SEO", included: true },
      { label: "Domain & hosting 1 tahun", included: true },
      { label: "Sertifikat SSL", included: true },
      { label: "Admin panel / CMS", included: true },
      { label: "Integrasi pembayaran", included: true },
    ],
    cta: "Diskusikan Kebutuhan",
    renewal: "Perpanjangan domain & hosting: sesuai server, mulai tahun ke-2",
    featured: false,
    premium: true,
  },
];

export const faqs = [
  {
    q: "Apa bedanya dengan website dari template?",
    a: "Setiap desain kami buat dari nol, dimulai dari brand, warna, dan kebutuhan bisnismu. Hasilnya tampilan yang dibuat khusus, dengan harga yang tetap masuk akal.",
  },
  {
    q: "Harganya sudah termasuk apa saja?",
    a: "Semua harga sudah termasuk desain custom, tampilan responsif, SEO, sertifikat SSL, serta domain dan hosting tahun pertama. Biaya perpanjangan domain dan hosting mulai tahun kedua tertulis di setiap kartu harga.",
  },
  {
    q: "Apa saja yang perlu disiapkan?",
    a: "Cukup info bisnismu, plus logo dan foto kalau sudah ada. Teks dan struktur halamannya kami bantu susun.",
  },
  {
    q: "Bisa lihat hasilnya sebelum tayang?",
    a: "Bisa. Kamu melihat preview di setiap tahap, jadi masukan bisa disampaikan sebelum website online.",
  },
  {
    q: "Sudah punya website, bisa dibantu?",
    a: "Bisa. Kami bantu perbarui tampilan atau perbaiki yang bermasalah. Kalau perlu dirawat rutin, ada layanan pembaruan konten, backup, dan pemantauan tiap bulan.",
  },
];
