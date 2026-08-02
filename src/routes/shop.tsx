import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { fetchProducts, fetchCollectionProducts, formatPrice } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";

const searchSchema = z.object({
  collection: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
});

function toHandle(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

function shopQuery(collection?: string) {
  if (!collection) {
    return queryOptions({
      queryKey: ["products", "all"],
      queryFn: () => fetchProducts(100),
      staleTime: 60_000,
    });
  }
  const handle = toHandle(collection);
  return queryOptions({
    queryKey: ["products", "collection", handle],
    queryFn: () => fetchCollectionProducts(handle, 100),
    staleTime: 60_000,
  });
}

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
  loaderDeps: ({ search }) => ({ collection: search.collection }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(shopQuery(deps.collection)),
  component: ShopPage,
});

const CATEGORIES = [
  { label: "All", collection: null },
  { label: "Bridal Lehngas", collection: "Bridal Lehngas" },
  { label: "Wedding Formal Dresses", collection: "Wedding Formal Dresses" },
  { label: "Semi Formal", collection: "Semi Formal" },
  { label: "Embroidered Pret", collection: "Embroidered Pret" },
  { label: "Velvets", collection: "Velvets" },
];

function ShopPage() {
  const { collection, priceMin, priceMax } = Route.useSearch();
  const { data: products } = useSuspenseQuery(shopQuery(collection));
  const navigate = useNavigate({ from: "/shop" });
  const active = collection ?? "All";

  const allPrices = useMemo(
    () => products.map((p) => parseFloat(p.node.priceRange.minVariantPrice.amount)),
    [products],
  );
  const globalMin = useMemo(() => Math.floor(Math.min(...allPrices)), [allPrices]);
  const globalMax = useMemo(() => Math.ceil(Math.max(...allPrices)), [allPrices]);
  const currencyCode = products[0]?.node.priceRange.minVariantPrice.currencyCode ?? "PKR";

  // Local slider state so the UI updates smoothly while dragging
  const [sliderValues, setSliderValues] = useState([
    priceMin ?? globalMin,
    priceMax ?? globalMax,
  ]);

  // Sync slider if URL params change externally
  useEffect(() => {
    setSliderValues([priceMin ?? globalMin, priceMax ?? globalMax]);
  }, [priceMin, priceMax, globalMin, globalMax]);

  const priceFiltered = priceMin !== undefined || priceMax !== undefined;

  function commitPrice(values: number[]) {
    const [lo, hi] = values;
    navigate({
      search: (prev) => ({
        ...prev,
        priceMin: lo > globalMin ? lo : undefined,
        priceMax: hi < globalMax ? hi : undefined,
      }),
    });
  }

  function clearPrice() {
    setSliderValues([globalMin, globalMax]);
    navigate({ search: (prev) => ({ ...prev, priceMin: undefined, priceMax: undefined }) });
  }

  const filtered = useMemo(() => {
    let result = products;
    if (priceMin !== undefined) result = result.filter((p) => parseFloat(p.node.priceRange.minVariantPrice.amount) >= priceMin);
    if (priceMax !== undefined) result = result.filter((p) => parseFloat(p.node.priceRange.minVariantPrice.amount) <= priceMax);
    return result;
  }, [products, priceMin, priceMax]);

  const sidebarContent = (
    <>
      {/* Collections */}
      <div className="mb-8">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-foreground/60">Collections</p>
        <div className="flex flex-col">
          {CATEGORIES.map((c) => {
            const isActive = active === (c.collection ?? "All");
            return (
              <Link
                key={c.label}
                to="/shop"
                search={(prev) => ({ ...prev, collection: c.collection ?? undefined })}
                className={`border-l-2 py-2 pl-3 text-[11px] uppercase tracking-[0.18em] transition-all duration-150 ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Price slider */}
      {globalMin < globalMax && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">Price</p>
            {priceFiltered && (
              <button
                onClick={clearPrice}
                className="text-[9px] uppercase tracking-wider text-muted-foreground underline underline-offset-2 hover:text-primary"
              >
                Clear
              </button>
            )}
          </div>
          <Slider
            min={globalMin}
            max={globalMax}
            step={Math.ceil((globalMax - globalMin) / 100)}
            value={sliderValues}
            onValueChange={setSliderValues}
            onValueCommit={commitPrice}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-[10px] tabular-nums text-muted-foreground">
            <span>{formatPrice(sliderValues[0], currencyCode)}</span>
            <span>{formatPrice(sliderValues[1], currencyCode)}</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div>
      {/* Banner */}
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <p className="eyebrow">The Edit</p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl">Shop the Atelier</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            Every piece is hand-embroidered in limited editions and made to your measurements.
          </p>
        </div>
      </section>

      {/* Mobile filter bar */}
      <div className="border-b border-border/60 bg-background/90 backdrop-blur md:hidden">
        <div className="flex gap-1 overflow-x-auto px-4 py-3 text-[11px] uppercase tracking-[0.22em]">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to="/shop"
              search={(prev) => ({ ...prev, collection: c.collection ?? undefined })}
              className={`whitespace-nowrap px-3 py-1.5 transition ${
                active === (c.collection ?? "All")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main: sidebar + grid */}
      <div className="mx-auto flex max-w-7xl gap-12 px-6 py-12">

        {/* Sidebar */}
        <aside className="hidden w-48 flex-shrink-0 md:block">
          <div className="sticky top-[112px]">
            <div className="mb-6 flex items-center justify-between">
              <p className="eyebrow">Filter</p>
              {(priceFiltered || active !== "All") && (
                <Link
                  to="/shop"
                  search={{}}
                  onClick={() => setSliderValues([globalMin, globalMax])}
                  className="text-[9px] uppercase tracking-wider text-muted-foreground underline underline-offset-2 hover:text-primary"
                >
                  Reset all
                </Link>
              )}
            </div>
            {sidebarContent}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <p className="mb-8 text-[11px] uppercase tracking-widest text-muted-foreground">
            {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
