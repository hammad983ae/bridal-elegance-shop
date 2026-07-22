import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  useEffect(() => {
    if (open) syncCart();
  }, [open, syncCart]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
          {totalItems > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-medium text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col bg-background sm:max-w-lg">
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <SheetTitle className="font-serif text-2xl font-medium">Your atelier bag</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Your bag is currently empty."
              : `${totalItems} piece${totalItems !== 1 ? "s" : ""} awaiting checkout`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingBag
                  className="mx-auto mb-4 h-10 w-10 text-muted-foreground"
                  strokeWidth={1}
                />
                <p className="text-sm text-muted-foreground">Nothing here yet.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4 border-b border-border/60 pb-5">
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary/40">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-lg leading-tight">
                            {item.product.node.title}
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.selectedOptions.map((o) => o.value).join(" • ")}
                          </p>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="inline-flex items-center border">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-2 hover:bg-secondary"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-2 hover:bg-secondary"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-serif text-lg">
                              {formatPrice(
                                parseFloat(item.price.amount) * item.quantity,
                                item.price.currencyCode,
                              )}
                            </p>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-shrink-0 space-y-4 border-t bg-background pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-serif text-2xl">{formatPrice(totalPrice, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxes and worldwide shipping calculated at checkout.
                </p>
                <Button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isLoading || isSyncing}
                  className="h-12 w-full rounded-none bg-primary text-sm uppercase tracking-[0.25em] text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" /> Secure Checkout
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}