import type { MenuItem, NavLink, Testimonial } from "../types/landing";

export const navLinks: NavLink[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Menu", href: "#menu" },
  { label: "Tentang", href: "#tentang" },
  { label: "Ulasan", href: "#testimoni" },
  { label: "Kontak", href: "#kontak" },
];

export const menuItems: MenuItem[] = [
  {
    id: "chicken-nanban-ricebowl",
    name: "Chicken Nanban RiceBowl",
    description:
      "Rice bowl dengan chicken crispy dan saus nanban manis-gurih.",
    price: 48125,
    image: "/images/menu-chicken-nanban.svg",
    tag: "Rice Bowl",
  },
  {
    id: "spaghetti-carbonara",
    name: "Spaghetti Carbonara",
    description:
      "Pasta creamy favorit dengan porsi pas untuk nongkrong santai.",
    price: 55000,
    image: "/images/menu-carbonara.svg",
    tag: "Western",
  },
  {
    id: "nasi-goreng-seafood",
    name: "Nasi Goreng Seafood",
    description:
      "Pilihan menu nusantara dengan bumbu kuat dan topping seafood lengkap.",
    price: 68750,
    image: "/images/menu-nasi-goreng.svg",
    tag: "Nusantara",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "ulasan-24-jam",
    name: "Pengunjung Malam",
    role: "Ringkasan ulasan publik",
    quote:
      "Tempatnya enak buat nongkrong panjang karena operasional 24 jam.",
    rating: 5,
  },
  {
    id: "ulasan-rooftop",
    name: "Penikmat Rooftop",
    role: "Ringkasan ulasan publik",
    quote:
      "Area rooftop dan live music bikin suasana malam lebih seru.",
    rating: 5,
  },
  {
    id: "ulasan-keluarga",
    name: "Pengunjung Akhir Pekan",
    role: "Ringkasan ulasan publik",
    quote:
      "Pilihan menu lokal dan western-nya beragam, cocok untuk datang bareng keluarga.",
    rating: 4,
  },
];
