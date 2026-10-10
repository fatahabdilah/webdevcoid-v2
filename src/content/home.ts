/**
 * Home page copy for webdev.co.id (Brand Guidelines v1.8): "kamu/kami", no "paket",
 * no technology names, no testimonials or fictional numbers. Prices and inclusions
 * come from webdev.co.id.
 */

/** "Kenapa kami", value proposition (2.3, 2.4). */
export const values = [
  {
    number: "01",
    title: "Desain custom, harga masuk akal",
    text: "Desain dibuat khusus untuk bisnismu, bukan template. Harganya tetap masuk akal.",
    icon: "/images/values/custom.svg",
  },
  {
    number: "02",
    title: "Kualitas premium, proses tidak ribet",
    text: "Dari desain sampai online, kami urus semuanya. Kamu fokus ke bisnis.",
    icon: "/images/values/premium.svg",
  },
  {
    number: "03",
    title: "Cepat dan mendukung tujuan bisnis",
    text: "Bukan cuma bagus dilihat, tapi cepat dibuka dan membantu bisnismu berkembang.",
    icon: "/images/values/fast.svg",
  },
];

export const featuredService = {
  title: "Company Profile.",
  text: "Website lengkap untuk bisnis yang mau tampil profesional dan kredibel.",
  checks: ["Sampai 6 halaman custom", "Form WhatsApp + email", "SEO"],
};

/** `art` picks the vector illustration in components/home/ServiceArt.tsx. */

export const services = [
  {
    title: "Landing Page.",
    text: "Satu halaman fokus untuk promosi, produk, atau profil singkat.",
    art: "landing",
  },
  {
    title: "Toko Online.",
    text: "Katalog produk yang rapi dan mudah dipesan langsung dari HP.",
    art: "store",
  },
  {
    title: "Web App.",
    text: "Untuk kebutuhan khusus: sistem, dashboard, atau fitur custom.",
    art: "webapp",
  },
  {
    title: "Perbarui & rawat website.",
    text: "Sudah punya website? Kami bantu perbarui tampilan, perbaiki yang bermasalah, dan rawat tiap bulan.",
    art: "maintenance",
  },
] as const;

/** "Sudah termasuk di setiap harga" tiles. */
export const security = [
  { label: "Domain & hosting tahun pertama", icon: "domain" },
  { label: "Sertifikat SSL", icon: "ssl" },
  { label: "Responsif semua perangkat", icon: "responsive" },
  { label: "SEO dasar", icon: "seo" },
] as const;

export const steps = [
  {
    number: "01",
    title: "Konsultasi gratis",
    text: "Ceritakan bisnismu lewat WhatsApp. Kami bantu tentukan jenis website yang paling pas.",
    icon: "magnify",
  },
  {
    number: "02",
    title: "Struktur & konten",
    text: "Halaman dan isinya kami susun. Kamu cukup mengarahkan.",
    icon: "structure",
  },
  {
    number: "03",
    title: "Desain custom",
    text: "Tampilan dibuat dari nol, mengikuti brand dan warna bisnismu.",
    icon: "settings",
  },
  {
    number: "04",
    title: "Preview tiap tahap",
    text: "Kamu melihat hasilnya di setiap tahap dan memberi masukan sebelum tayang.",
    icon: "graph",
  },
  {
    number: "05",
    title: "Website tayang",
    text: "Domain, hosting, dan SSL kami pasang. Bisnismu siap ditemukan online.",
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
    tagline: "Satu halaman fokus untuk promosi, produk, atau profil singkat.",
    from: false,
    price: "1.490",
    features: [
      { label: "1 halaman desain custom", included: true },
      { label: "Responsif semua perangkat", included: true },
      { label: "Form terhubung WhatsApp", included: true },
      { label: "SEO dasar", included: true },
      { label: "Domain & hosting 1 tahun", included: true },
      { label: "Sertifikat SSL", included: true },
      { label: "Halaman tambahan", included: false },
      { label: "Admin panel / CMS", included: false },
    ],
    cta: "Mulai Sekarang",
    renewal: "Perpanjangan domain & hosting: Rp750.000/tahun mulai tahun ke-2",
    featured: false,
  },
  {
    name: "Company Profile",
    tagline: "Website lengkap untuk bisnis yang mau tampil profesional dan kredibel.",
    from: false,
    price: "2.990",
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
    renewal: "Perpanjangan domain & hosting: Rp1.500.000/tahun mulai tahun ke-2",
    featured: true,
  },
  {
    name: "Web App / Custom",
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
    a: "Semua harga sudah termasuk desain custom, tampilan responsif, SEO dasar, sertifikat SSL, serta domain dan hosting tahun pertama. Biaya perpanjangan domain dan hosting mulai tahun kedua tertulis di setiap kartu harga.",
  },
  {
    q: "Apa yang perlu disiapkan?",
    a: "Cukup ceritakan bisnismu lewat WhatsApp. Struktur, desain, dan kontennya kami yang susun bersama kamu.",
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
