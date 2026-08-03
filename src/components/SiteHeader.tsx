import { Link } from "@tanstack/react-router";
import { Menu, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { CartDrawer } from "./CartDrawer";
import { COLLECTIONS } from "@/lib/collections";

const NAV_LINK_CLASS =
  "relative pb-px text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-200 hover:text-foreground " +
  "after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full";

const NAV_ACTIVE_CLASS = "text-foreground after:!w-full";

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40">
      {/* Promo bar */}
      <div className="bg-primary px-4 py-2 text-center text-[10px] uppercase tracking-[0.28em] text-primary-foreground/85">
        Made To Order (4-6 Weeks) | Worldwide Shipping | Ready Made (8 Days Delivery)
      </div>

      {/* Main header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-6">

          {/* Left */}
          <div className="flex flex-1 items-center">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary md:hidden"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.4} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background px-0 pt-0">
                <div className="border-b border-border/60 px-6 py-5">
                  <img src="/brand/logo.png" alt="Faiza Amjad Studio" className="h-10 w-auto" />
                </div>
                <nav className="flex flex-col px-6 pt-4">
                  <SheetClose asChild>
                    <Link
                      to="/"
                      className="border-b border-border/40 py-4 text-[12px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-primary"
                    >
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/shop"
                      className="border-b border-border/40 py-4 text-[12px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-primary"
                    >
                      All Products
                    </Link>
                  </SheetClose>
                  <p className="pb-2 pt-5 text-[9px] uppercase tracking-[0.35em] text-muted-foreground/60">
                    Collections
                  </p>
                  {COLLECTIONS.filter((c) => c.collection !== "New Arrivals").map((c) => (
                    <SheetClose asChild key={c.collection}>
                      <Link
                        to="/shop"
                        search={{ collection: c.collection }}
                        className="border-b border-border/40 py-3.5 text-[12px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-primary"
                      >
                        {c.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link
                      to="/shop"
                      search={{ collection: "Ready Made Sale" }}
                      className="border-b border-border/40 py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold animate-pulse text-red-600 transition hover:text-red-500"
                    >
                      Ready Made Sale (upto 50%)
                    </Link>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-9 md:flex">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                className={NAV_LINK_CLASS}
                activeProps={{ className: NAV_ACTIVE_CLASS }}
              >
                Home
              </Link>

              {/* Collections dropdown */}
              <div className="group relative">
                <button
                  className={
                    NAV_LINK_CLASS +
                    " flex cursor-default select-none items-center gap-1.5 group-hover:text-foreground group-hover:after:w-full"
                  }
                >
                  Collections
                  <ChevronDown
                    className="h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-180"
                    strokeWidth={2}
                  />
                </button>

                {/* Dropdown panel — pt-3 bridges the gap so hover doesn't break */}
                <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="w-56 border border-border/70 bg-background shadow-lg">
                    <Link
                      to="/shop"
                      className="flex items-center justify-between border-b border-border/40 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      All Collections <span className="text-primary">→</span>
                    </Link>
                    <div className="py-1">
                      {COLLECTIONS.map((c) => (
                        <Link
                          key={c.collection}
                          to="/shop"
                          search={{ collection: c.collection }}
                          className="flex items-center px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/shop"
                search={{ collection: "Ready Made Sale" }}
                className="relative pb-px text-[11px] uppercase tracking-[0.22em] font-semibold animate-pulse text-red-600 hover:text-red-500 transition-colors duration-200"
              >
                Ready Made Sale (upto 50%)
              </Link>
            </nav>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex flex-1 items-center justify-center">
            <img src="/brand/logo.png" alt="Faiza Amjad Studio" className="h-[92px] w-[149px] md:h-[114px] md:w-[184px]" />
          </Link>

          {/* Right: Cart */}
          <div className="flex flex-1 items-center justify-end gap-2">
            <CartDrawer />
          </div>
        </div>
      </header>
    </div>
  );
}