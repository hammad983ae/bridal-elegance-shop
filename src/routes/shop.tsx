import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchProducts } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";

const searchSchema = z.object({
  collection: z.string().optional(),
});

const allProductsQuery = queryOptions({
  queryKey: ["all-products"],
  queryFn: () => fetchProducts(50),
  staleTime: 60_000,
});

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Shop the Atelier — Faiza Amjad Studio" },
      {
        name: "description",
        content:
          "Browse bridal lehngas, wedding formals, semi-formal and velvet couture by Faiza Amjad Studio.",
      },
      { property: "og:title", content: "Shop the Atelier — Faiza Amjad Studio" },
      {
        property: "og:description",
        content:
          "Browse bridal lehngas, wedding formals, semi-formal and velvet couture by Faiza Amjad Studio.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allProductsQuery),
  component: ShopPage,
});

const CATEGORIES = ["All", "Bridal Lehngas", "Wedding Formal Dresses", "Semi Formal", "Embroidered Pret", "Velvets"];

function ShopPage() {
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const { collection } = Route.useSearch();
  const active = collection ?? "All";
  const filtered = active === "All" ? products : products.filter((p) => p.node.productType === active);

  return (
    <div>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="eyebrow">The Edit</p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl">Shop the Atelier</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            Every piece is hand-embroidered in limited editions and made to your measurements.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 py-3 text-[12px] uppercase tracking-[0.22em]">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/shop"
              search={c === "All" ? {} : { collection: c }}
              className={`whitespace-nowrap px-4 py-2 transition ${
                active === c
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <p className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
          {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
        </p>
        {filtered.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}