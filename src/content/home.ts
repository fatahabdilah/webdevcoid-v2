/**
 * Home page copy for webdev.co.id (Brand Guidelines v1.8): "kamu/kami", no "paket",
 * no technology names, no testimonials or fictional numbers. Prices and inclusions
 * come from webdev.co.id. Images are still the template's and get replaced later.
 */
const img = (id: string) => `/framer/${id}`;

/** "Kenapa kami", value proposition (2.3, 2.4). */
export const values = [
  {
    number: "01",
    title: "Desain custom, harga masuk akal",
    text: "Desain dibuat khusus untuk bisnismu, bukan template. Harganya tetap masuk akal.",
    icon: img("LNLGq4ZhhjYcWwLsunsuXQRG3Is.svg"),
  },
  {
    number: "02",
    title: "Kualitas premium, proses tidak ribet",
    text: "Dari desain sampai online, kami urus semuanya. Kamu fokus ke bisnis.",
    icon: img("ykvnFaXAawiyfPKFWFuC3QiKw.svg"),
  },
  {
    number: "03",
    title: "Cepat dan mendukung tujuan bisnis",
    text: "Bukan cuma bagus dilihat, tapi cepat dibuka dan membantu bisnismu berkembang.",
    icon: img("B3xPzQo8UIwVCTcNg947sHqGE.svg"),
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

/** "Satu pintu" marquee: what we take care of. */
export const integrations = [
  { title: "Desain", logo: img("2xquyjyFTB2qMqOwhpLzMdYE.png") },
  { title: "Konten", logo: img("5uPQw4lqjfuPQVY56gQ2VAps.png") },
  { title: "Domain", logo: img("ZlucgVlz0X3yiswDce5ZZWPzxnU.png") },
  { title: "Hosting", logo: img("ZQy4IZjczFBHr315feUz6FY9Jc.png") },
  { title: "Sertifikat SSL", logo: img("qn0FSop5Ezs3MCS3AzMwD3o2NR4.png") },
  { title: "SEO dasar", logo: img("NJei4VUurepCT7nFvab7lNWfGuE.png") },
  { title: "Form WhatsApp", logo: img("AhQIGlem4StUQWPLgPR6MUs5ioY.png") },
  { title: "Responsif", logo: img("oin8QcjYXzUlmHfyHtNW6VeuO4.png") },
  { title: "Backup", logo: img("cDjkCDrLWvNdD8oA4b1Pjx9RaM.png") },
  { title: "Perawatan", logo: img("VK3pQ5OWeJjNxkJwuh2e4tWvU.png") },
];

export type Testimonial =
  | { kind: "quote"; name: string; role: string; avatar: string; quote: string }
  | { kind: "video"; title: string; image: string; logo: string; href: string };

/** "Untuk siapa": one card per segment with its key message (2.2, 10.4). */
const segment = (name: string, role: string, avatar: string, quote: string): Testimonial => ({
  kind: "quote",
  name,
  role,
  avatar: img(avatar),
  quote,
});
const work = (title: string, image: string, href: string): Testimonial => ({
  kind: "video",
  title,
  image: img(image),
  logo: img("tQe8KYZERtfj6dEWPfoEV61M2Q.png"),
  href,
});

/** Three masonry columns, in the order they appear on desktop. */
export const testimonialColumns: Testimonial[][] = [
  [
    work("Website portofolio untuk videografer pernikahan", "aSmMadORFrjf0SEWGxtfp2qXEmA.png", "https://arifsyauqi.com"),
    segment(
      "Brand baru",
      "Butuh website pertama",
      "z6cPmsnJML2flePXMqm2kdZG6EI.png",
      "Mulai dengan website yang langsung bikin brand kamu kelihatan meyakinkan.",
    ),
    segment(
      "Startup",
      "Landing page atau produk web",
      "BnPovhu3UVva8wf8pdIhGnyeu0.png",
      "Website cepat dan modern, dieksekusi tanpa drama, siap mendukung pertumbuhan.",
    ),
  ],
  [
    segment(
      "Perusahaan",
      "Company profile atau redesign",
      "io1ebA6nKd3sIhRozjyWCmW7Pk.png",
      "Company profile profesional yang mencerminkan kredibilitas bisnis kamu.",
    ),
    segment(
      "Institusi & organisasi",
      "Profil, informasi, dan pendaftaran online",
      "Nc7T0UP7TMYghubatYlzblQr3vc.png",
      "Website institusi yang rapi dan informatif, memudahkan publik mengakses informasi dan layanan secara online.",
    ),
    segment(
      "UMKM",
      "Ingin naik kelas secara online",
      "Jd4Actw3iicp7lVmQL6Tty7Ezw.png",
      "Tampil lebih meyakinkan secara online, supaya pelanggan baru lebih mudah menemukan dan percaya.",
    ),
  ],
  [
    segment(
      "Personal brand",
      "Profesional dan kreator",
      "ZWhfkzGB6c8iJeDzvp6nt6xFt4.png",
      "Website pribadi yang merangkum karya dan cara menghubungimu di satu tempat.",
    ),
    work("Company profile untuk distributor uPVC", "mKS6dvxPlvfsWt7d3VskQg0q8.png", "https://sekartama-upvc.com"),
  ],
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

/** "Yang selalu kamu dapat": shown in the slider that used to hold the team. */
export const team = [
  { name: "Dirancang khusus", role: "Bukan template", image: img("V58sx7NhvVNAahpHlBmHCwyRE20.png") },
  { name: "Satu pintu", role: "Domain, hosting, dan maintenance kami urus", image: img("kDCbKE8EXCPmfNs0LiD0FOFgGQ.png") },
  { name: "Harga jelas di awal", role: "Tanpa biaya tersembunyi", image: img("8D58J0L0stwsgjpU28TcU3dZD4.png") },
  { name: "Klien langsung terhubung", role: "Masuk ke WhatsApp dan email", image: img("EBzCzs24ynmp6mfap9BtX0EPGE.png") },
  { name: "Preview tiap tahap", role: "Kamu lihat hasilnya sebelum tayang", image: img("3ydsPax1LnJDd6x2DAPVs72nc.png") },
  { name: "Responsif", role: "Rapi dibuka dari HP maupun laptop", image: img("JxwQVocV64XDacrtefjU7j939g.png") },
  { name: "Domain & hosting", role: "Tahun pertama sudah termasuk", image: img("0UWfIIl9o3uf2tUEwLcyINjvIgU.png") },
];

/** The team cards had personal social links; commitments don't. */
export const teamSocials: { label: string; href: string; icon: string }[] = [];

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
