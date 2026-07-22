import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowRight, Scissors, Truck, Sparkles } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";

const productsQuery = queryOptions({
  queryKey: ["home-products"],
  queryFn: () => fetchProducts(24),
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
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: HomePage,
});

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = products.slice(0, 8);
  const heroImage = products.find((p) => p.node.productType === "Bridal Lehngas")?.node.images.edges[0]?.node
    ?? products[0]?.node.images.edges[0]?.node;

  const collections = [
    { name: "Bridal Lehngas", tagline: "Statement heirlooms" },
    { name: "Wedding Formal Dresses", tagline: "The occasion edit" },
    { name: "Semi Formal", tagline: "Everyday luxe" },
    { name: "Velvets", tagline: "Winter couture" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] w-full overflow-hidden">
        {heroImage && (
          <img
            src={heroImage.url}
            alt={heroImage.altText ?? "Faiza Amjad bridal couture"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-background" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32">
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
      </section>

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
            const cover = products.find((p) => p.node.productType === c.name)?.node.images.edges[0]?.node
              ?? products[0]?.node.images.edges[0]?.node;
            return (
              <Link
                key={c.name}
                to="/shop"
                search={{ collection: c.name }}
                className="group relative aspect-[3/4] overflow-hidden bg-secondary/40"
              >
                {cover && (
                  <img
                    src={cover.url}
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
            <p className="eyebrow">New arrivals</p>
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