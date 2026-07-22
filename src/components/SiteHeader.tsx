import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <nav className="hidden flex-1 items-center gap-8 text-[13px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
          <Link to="/" className="transition hover:text-primary">Home</Link>
          <Link to="/shop" className="transition hover:text-primary">Shop</Link>
          <Link
            to="/shop"
            search={{ collection: "Bridal Lehngas" }}
            className="transition hover:text-primary"
          >
            Bridal
          </Link>
        </nav>

        <Link
          to="/"
          className="flex-1 text-center font-serif text-xl tracking-[0.3em] text-primary md:text-2xl"
        >
          FAIZA AMJAD
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}