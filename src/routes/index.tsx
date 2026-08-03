import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useSuspenseQueries } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, Scissors, Truck, Sparkles, PenTool, Ruler } from "lucide-react";
import { fetchProducts, fetchCollectionProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { CustomDesignDialog } from "@/components/CustomDesignDialog";

function toHandle(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

const productsQuery = queryOptions({
  queryKey: ["home-products"],
  queryFn: () => fetchProducts(24),
  staleTime: 60_000,
});

const saleQuery = queryOptions({
  queryKey: ["collection", "ready-made-sale"],
  queryFn: () => fetchCollectionProducts("ready-made-sale", 8),
  staleTime: 60_000,
});

const OCCASION_COLLECTIONS = [
  { name: "Bridal Lehngas", tagline: "Statement heirlooms" },
  { name: "Wedding Formal Dresses", tagline: "The occasion edit" },
  { name: "Semi Formal", tagline: "Everyday luxe" },
  { name: "Velvets", tagline: "Winter couture" },
];

const occasionCoverQuery = (name: string) =>
  queryOptions({
    queryKey: ["collection-cover", toHandle(name)],
    queryFn: () => fetchCollectionProducts(toHandle(name), 1),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faiza Amjad Studio — Bridal & Formal Couture" },
      {
        name: "description",
        content:
          "Discover handcrafted bridal lehngas, wedding formals and semi-formal couture by Faiza Amjad Studio. Made-to-order, shipped worldwide.",
      },
      { property: "og:title", content: "Faiza Amjad Studio — Bridal & Formal Couture" },
      {
        property: "og:description",
        content:
          "Discover handcrafted bridal lehngas, wedding formals and semi-formal couture. Made-to-order, shipped worldwide.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(saleQuery),
      ...OCCASION_COLLECTIONS.map((c) =>
        context.queryClient.ensureQueryData(occasionCoverQuery(c.name)),
      ),
    ]),
  component: HomePage,
});

const HERO_SLIDES = [
  { url: "/hero/hero-1.jpg", alt: "Faiza Amjad bridal couture" },
  { url: "/hero/hero-2.jpg", alt: "Faiza Amjad bridal couture" },
  { url: "/hero/hero-3.jpg", alt: "Faiza Amjad bridal couture" },
];

function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      {/* Slides */}
      <div ref={emblaRef} className="absolute inset-0">
        <div className="flex h-full">
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} className="relative min-w-full flex-shrink-0 bg-black">
              <img
                src={slide.url}
                alt={slide.alt}
                className="h-full w-full object-contain object-[center_40%] md:object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-background" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-6 pb-24 pt-32">
        <p className="eyebrow text-background/80">Autumn / Winter Edit — Now Shipping</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-medium leading-[1.05] text-background md:text-7xl">
          Bridal couture,<br />
          <em className="italic text-background/95">hand-embroidered to be worn forever.</em>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-background/85">
          An atelier of eastern bridal lehngas, wedding formals and everyday luxe — cut, embroidered
          and finished by artisans in limited editions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center justify-center gap-2 bg-background px-8 text-[12px] uppercase tracking-[0.28em] text-primary transition hover:bg-background/90"
          >
            Shop the Edit <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/shop"
            search={{ collection: "Bridal Lehngas" }}
            className="inline-flex h-12 items-center justify-center border border-background/70 px-8 text-[12px] uppercase tracking-[0.28em] text-background transition hover:bg-background/10"
          >
            Bridal Atelier
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-[3px] transition-all duration-300 ${
              i === selectedIndex ? "w-8 bg-background" : "w-4 bg-background/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: saleProducts } = useSuspenseQuery(saleQuery);
  const featured = products.slice(0, 8);

  const occasionCovers = useSuspenseQueries({
    queries: OCCASION_COLLECTIONS.map((c) => occasionCoverQuery(c.name)),
  });
  const collections = OCCASION_COLLECTIONS.map((c, i) => ({
    ...c,
    cover: occasionCovers[i].data[0]?.node.images.edges[0]?.node,
  }));

  const customCover = products[8]?.node.images.edges[0]?.node ?? products[0]?.node.images.edges[0]?.node;

  return (
    <div>
      {/* HERO */}
      <HeroCarousel />

      {/* MARQUEE VALUE PROPS */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { icon: Scissors, title: "Made-to-measure", copy: "Every piece cut to your measurements in 4–6 weeks." },
            { icon: Truck, title: "Worldwide shipping", copy: "Insured, tracked delivery from Lahore to your door." },
            { icon: Sparkles, title: "Hand-embroidered", copy: "Zardozi, dabka and pearl work by master karigars." },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 px-6 py-6">
              <item.icon className="h-5 w-5 text-primary" strokeWidth={1.4} />
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SALE */}
      {saleProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow text-red-600">Limited time</p>
              <h2 className="mt-2 font-serif text-4xl md:text-5xl">Ready Made Sale</h2>
            </div>
            <Link
              to="/shop"
              search={{ collection: "Ready Made Sale" }}
              className="hidden text-[12px] uppercase tracking-[0.25em] text-red-600 hover:underline md:inline-flex"
            >
              Shop the sale →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {saleProducts.map((p: ShopifyProduct) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Link
              to="/shop"
              search={{ collection: "Ready Made Sale" }}
              className="text-[12px] uppercase tracking-[0.25em] text-red-600 hover:underline"
            >
              Shop the sale →
            </Link>
          </div>
        </section>
      )}

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">Curated categories</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">Shop by occasion</h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-[12px] uppercase tracking-[0.25em] text-primary hover:underline md:inline-flex"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {collections.map((c) => {
            return (
              <Link
                key={c.name}
                to="/shop"
                search={{ collection: c.name }}
                className="group relative aspect-[3/4] overflow-hidden bg-secondary/40"
              >
                {c.cover && (
                  <img
                    src={c.cover.url}
                    alt={c.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-background">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-background/80">{c.tagline}</p>
                  <p className="mt-1 font-serif text-xl">{c.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">The full edit</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">The latest atelier drops</h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-[12px] uppercase tracking-[0.25em] text-primary hover:underline md:inline-flex"
          >
            See the full edit →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p: ShopifyProduct) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CUSTOM DESIGN */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 aspect-[4/5] overflow-hidden bg-secondary/40 lg:order-1">
            {customCover ? (
              <img
                src={customCover.url}
                alt="Custom bespoke piece"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src="/hero/hero-3.jpg"
                alt="Custom bespoke piece"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow">Bespoke by design</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
              Create a piece that exists only for you.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Bring your own vision — a silhouette, a fabric, an heirloom motif — and our design
              team will craft it from the first sketch to the final fitting, made-to-measure
              entirely around you.
            </p>

            <div className="mt-9 space-y-6">
              {[
                {
                  icon: PenTool,
                  title: "Consult",
                  copy: "Share your vision in a private appointment with our design team.",
                },
                {
                  icon: Ruler,
                  title: "Design & fit",
                  copy: "We sketch your silhouette, fabric and embroidery, then take your measurements.",
                },
                {
                  icon: Scissors,
                  title: "Hand-craft",
                  copy: "Master karigars embroider and tailor your piece in 4–6 weeks.",
                },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-primary/30 text-primary">
                    <step.icon className="h-4 w-4" strokeWidth={1.4} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <CustomDesignDialog>
              <button className="mt-9 inline-flex h-12 items-center gap-2 bg-primary px-8 text-[12px] uppercase tracking-[0.28em] text-primary-foreground transition hover:bg-primary/90">
                Start designing <ArrowRight className="h-4 w-4" />
              </button>
            </CustomDesignDialog>
          </div>
        </div>
      </section>

      {/* EDITORIAL CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden bg-primary px-6 py-20 text-center text-primary-foreground md:px-16 md:py-28">
          <p className="eyebrow text-primary-foreground/70">The bridal consultation</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl md:text-5xl">
            Design a piece that's yours alone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80">
            Book a private appointment with our design team to commission a custom bridal or formal
            ensemble — from silhouette to embroidery motif.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-12 items-center gap-2 bg-background px-8 text-[12px] uppercase tracking-[0.28em] text-primary transition hover:bg-background/90"
          >
            Begin your commission <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}