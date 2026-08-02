import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const node = product.node;
  const image = node.images.edges[0]?.node;
  const hoverImage = node.images.edges[1]?.node ?? image;
  const firstVariant = node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const compareAt = node.compareAtPriceRange?.minVariantPrice;
  const isOnSale =
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions ?? [],
    });
    toast.success("Added to bag", {
      description: node.title,
      position: "top-right",
    });
  };

  return (
    <Link to="/product/$handle" params={{ handle: node.handle }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/40">
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            loading="lazy"
          />
        )}
        {hoverImage && (
          <img
            src={hoverImage.url}
            alt={hoverImage.altText ?? node.title}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            loading="lazy"
          />
        )}
        <button
          onClick={handleAdd}
          disabled={isLoading || !firstVariant?.availableForSale}
          className="absolute inset-x-4 bottom-4 inline-flex h-11 items-center justify-center gap-2 bg-primary/95 text-[11px] uppercase tracking-[0.25em] text-primary-foreground opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50 md:translate-y-2"
          aria-label={`Add ${node.title} to bag`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Quick Add
            </>
          )}
        </button>
        {node.productType && (
          <span className="absolute left-3 top-3 bg-background/85 px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {node.productType}
          </span>
        )}
        {isOnSale && (
          <span className="absolute right-3 top-3 bg-red-600 px-2 py-1 text-[10px] uppercase tracking-widest text-white">
            Sale
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-base font-medium leading-snug text-foreground group-hover:text-primary">
          {node.title}
        </h3>
        {isOnSale && compareAt ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-serif text-[12px] text-muted-foreground line-through">
              {formatPrice(compareAt.amount, compareAt.currencyCode)}
            </span>
            <span className="font-serif text-base text-red-600">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
          </div>
        ) : (
          <p className="font-serif text-base text-primary">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        )}
      </div>
    </Link>
  );
}