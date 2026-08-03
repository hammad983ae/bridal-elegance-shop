import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, Truck, RotateCcw, Scissors } from "lucide-react";
import { toast } from "sonner";
import { fetchProductByHandle, formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

const productQuery = (handle: string) =>
  queryOptions({
    queryKey: ["product", handle],
    queryFn: async () => {
      const p = await fetchProductByHandle(handle);
      if (!p) throw notFound();
      return p;
    },
    staleTime: 60_000,
  });

export const Route = createFileRoute("/product/$handle")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.handle)),
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Product";
    const description = loaderData?.description?.slice(0, 155) ?? "Faiza Amjad Studio couture piece.";
    const image = loaderData?.images?.edges?.[0]?.node?.url;
    return {
      meta: [
        { title: `${title} — Faiza Amjad Studio` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — Faiza Amjad Studio` },
        { property: "og:description", content: description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-serif text-4xl">Piece not found</h1>
      <Link to="/shop" className="mt-6 inline-block text-sm uppercase tracking-widest text-primary hover:underline">
        Back to shop
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-serif text-3xl">Couldn't load this piece</h1>
      <Link to="/shop" className="mt-6 inline-block text-sm uppercase tracking-widest text-primary hover:underline">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(handle));
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [variantIdx, setVariantIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [galleryApi, setGalleryApi] = useState<CarouselApi>();
  const variants = product.variants.edges;
  const selected = variants[variantIdx]?.node ?? variants[0]?.node;
  const images = product.images.edges;
  const price = selected?.price ?? product.priceRange.minVariantPrice;
  const compareAt = selected?.compareAtPrice ?? product.compareAtPriceRange?.minVariantPrice;
  const isOnSale = compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);

  useEffect(() => {
    if (!galleryApi) return;
    const onSelect = () => setImgIdx(galleryApi.selectedScrollSnap());
    galleryApi.on("select", onSelect);
    return () => {
      galleryApi.off("select", onSelect);
    };
  }, [galleryApi]);

  useEffect(() => {
    galleryApi?.scrollTo(imgIdx);
  }, [galleryApi, imgIdx]);

  const handleAdd = async () => {
    if (!selected) return;
    const productWrapper: ShopifyProduct = { node: product };
    const success = await addItem({
      product: productWrapper,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      selectedOptions: selected.selectedOptions ?? [],
    });
    if (success) {
      toast.success("Added to bag", { description: product.title, position: "top-right" });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* GALLERY */}
        <div>
          <Carousel setApi={setGalleryApi} opts={{ loop: images.length > 1 }} className="w-full">
            <CarouselContent className="ml-0">
              {images.map((im) => (
                <CarouselItem key={im.node.url} className="pl-0">
                  <div className="aspect-[3/4] overflow-hidden bg-secondary/40">
                    <img
                      src={im.node.url}
                      alt={im.node.altText ?? product.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((im, i) => (
                <button
                  key={im.node.url}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-[3/4] overflow-hidden border transition ${
                    i === imgIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={im.node.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.productType && (
            <p className="eyebrow">{product.productType}</p>
          )}
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.title}</h1>
          {isOnSale && compareAt ? (
            <p className="mt-3 flex items-baseline gap-3">
              <span className="font-serif text-2xl text-red-600">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              <span className="font-serif text-base text-muted-foreground line-through">
                {formatPrice(compareAt.amount, compareAt.currencyCode)}
              </span>
            </p>
          ) : (
            <p className="mt-3 font-serif text-2xl text-primary">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
          )}

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {variants.length > 1 && (
            <div className="mt-8">
              <p className="eyebrow mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => (
                  <button
                    key={v.node.id}
                    onClick={() => setVariantIdx(i)}
                    disabled={!v.node.availableForSale}
                    className={`min-w-14 border px-4 py-2 text-[12px] uppercase tracking-widest transition ${
                      i === variantIdx
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {v.node.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={isLoading || !selected?.availableForSale}
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 bg-primary text-[12px] uppercase tracking-[0.28em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                {selected?.availableForSale ? "Add to Bag" : "Sold Out"}
              </>
            )}
          </button>

          <div className="mt-8 grid gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Scissors className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.4} />
              <span>Made-to-measure in 4–6 weeks by our master karigars.</span>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.4} />
              <span>Insured worldwide shipping, tracked from Lahore.</span>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.4} />
              <span>7-day exchange on ready-to-ship pieces.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}