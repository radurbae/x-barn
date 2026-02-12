import type { MenuItem, NavLink, Testimonial } from "../types/landing";

export const navLinks: NavLink[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Menu", href: "#menu" },
  { label: "Tentang", href: "#tentang" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Kontak", href: "#kontak" },
];

export const menuItems: MenuItem[] = [
  {
    id: "espresso-klasik",
    name: "Espresso Klasik",
    description:
      "Rasa pekat dengan karakter cokelat pahit yang tegas, disajikan hangat.",
    price: 28000,
    image: "https://picsum.photos/seed/espresso/640/420",
    tag: "Andalan",
  },
  {
    id: "latte-senja",
    name: "Latte Senja",
    description:
      "Perpaduan espresso dan susu steam dengan tekstur lembut untuk sore santai.",
    price: 34000,
    image: "https://picsum.photos/seed/latte/640/420",
    tag: "Favorit",
  },
  {
    id: "kopi-gula-aren",
    name: "Kopi Gula Aren",
    description:
      "Aroma kopi nusantara dengan manis alami gula aren yang seimbang.",
    price: 32000,
    image: "https://picsum.photos/seed/gulaaren/640/420",
    tag: "Lokal",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "nadia",
    name: "Nadia Putri",
    role: "Desainer Produk",
    quote:
      "Tempatnya tenang untuk kerja fokus, dan rasa kopinya konsisten setiap datang.",
    rating: 5,
  },
  {
    id: "bagas",
    name: "Bagas Pratama",
    role: "Pengusaha Kuliner",
    quote:
      "Latte di sini punya balance yang pas. Pelayanan cepat dan ramah.",
    rating: 5,
  },
  {
    id: "rani",
    name: "Rani Amelia",
    role: "Kreator Konten",
    quote:
      "Lokasinya strategis, pilihan menu tidak berlebihan, tapi semuanya enak.",
    rating: 4,
  },
];
