import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  Coffee,
  Layers,
  Package,
  Receipt,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const highlights = [
  {
    title: 'Fast checkout flow',
    description:
      'Optimized product search, category filtering, and cart controls built for speed on busy shifts.',
    icon: Zap,
  },
  {
    title: 'Inventory + recipes',
    description:
      'Track ingredient stock and tie recipes to products for tighter cost control.',
    icon: Package,
  },
  {
    title: 'Sales visibility',
    description:
      'Daily, weekly, and monthly sales summaries with top product insights.',
    icon: BarChart3,
  },
];

const stack = [
  'Next.js (App Router)',
  'Supabase (Auth + Postgres)',
  'Zustand state management',
  'Tailwind CSS',
  'Radix UI primitives',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.25),transparent_60%)]" />
          <div className="absolute -right-40 top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_60%)]" />
        </div>

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Barn Coffee POS</p>
              <p className="text-xs text-slate-400">Portfolio Case Study</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Button asChild variant="ghost" className="text-slate-200">
              <Link href="#case-study">Case Study</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-100">
              <Link href="/login">Launch Demo</Link>
            </Button>
          </div>
        </header>

        <section className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
              <Sparkles className="h-3 w-3" />
              Built for modern coffee teams
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              A barista-first POS experience that keeps every shift smooth.
            </h1>
            <p className="text-lg text-slate-300">
              Barn Coffee POS is a portfolio product simulating a full coffee shop flow: fast checkout, live inventory, recipe-driven stock, and clear reporting. It’s designed as a real-world operations dashboard, not just a UI mock.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                <Link href="/login">
                  Launch Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-700 text-slate-100">
                <Link href="/pos">Go to App</Link>
              </Button>
            </div>
            <div className="grid gap-4 pt-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Key Focus</p>
                <p className="text-lg font-semibold">Checkout speed</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Data</p>
                <p className="text-lg font-semibold">Inventory + Recipes</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Insights</p>
                <p className="text-lg font-semibold">Daily sales</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900/40 to-cyan-500/10 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
                  <p className="mt-2 text-lg font-semibold">Cashier Dashboard</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  Demo Mode
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['Espresso', 'Iced Latte', 'Matcha'].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/5 bg-white/5 p-3"
                    >
                      <p className="text-sm font-medium text-white">{item}</p>
                      <p className="text-xs text-slate-400">Tap to add</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Cart total</span>
                    <span className="font-semibold text-amber-300">Rp 185.000</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <item.icon className="h-6 w-6 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="case-study" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.6fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
              <Layers className="h-3 w-3" />
              Case Study
            </div>
            <h2 className="text-3xl font-semibold">Why this project exists</h2>
            <p className="text-slate-300">
              Coffee shops need a clean, fast POS that keeps baristas in flow and gives managers clear visibility into costs and sales. This project demonstrates product thinking, data modeling, and UI polish in a realistic operational setting.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Demo credentials</p>
              <p className="text-sm text-slate-200">Use any email + password to sign in.</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <h3 className="text-lg font-semibold">Project outcomes</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Designed end-to-end POS flows: cashier, inventory, menu, and reporting.</li>
                <li>Modeled real operations with recipes, stock deductions, and daily sales tracking.</li>
                <li>Built bilingual UI support (ID/EN) with currency-aware formatting.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-amber-300" />
                <h3 className="text-lg font-semibold">What to review in the demo</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Quick add-to-cart flows with instant totals and tax calculation.</li>
                <li>Inventory thresholds with low-stock warnings and valuation.</li>
                <li>Reporting view with recent orders, top products, and export.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h2 className="text-3xl font-semibold">Built with a modern product stack</h2>
              <p className="mt-3 text-slate-300">
                The architecture focuses on fast iteration, secure data access, and a clean UI system that scales across multiple operational screens.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                {stack.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ready to explore</p>
                <p className="mt-2 text-lg font-semibold">Walk through the full POS flow</p>
                <p className="mt-2 text-sm text-slate-300">
                  Launch the demo to explore cashier, inventory, menu setup, and reporting with realistic data.
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                <Link href="/login">
                  Launch Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
