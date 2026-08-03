import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <img src="/brand/logo.png" alt="Faiza Amjad Studio" className="h-28 w-auto" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            An atelier of eastern bridal couture, wedding formals and everyday luxe — hand-embroidered in
            limited editions, shipped worldwide.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary">All Pieces</Link></li>
            <li><Link to="/shop" search={{ collection: "Bridal Lehngas" }} className="hover:text-primary">Bridal Lehngas</Link></li>
            <li><Link to="/shop" search={{ collection: "Wedding Formal Dresses" }} className="hover:text-primary">Wedding Formals</Link></li>
            <li><Link to="/shop" search={{ collection: "Semi Formal" }} className="hover:text-primary">Semi Formal</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Atelier</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Made-to-order in 4–6 weeks</li>
            <li>Worldwide shipping</li>
            <li>Bespoke consultations</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Visit Us</p>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.4} />
              <span className="leading-relaxed">
                88-T, Habib Metro Bank Basement,
                <br />
                2 Lalak Jan Chowk, Sector T DHA Phase 3,
                <br />
                Lahore, Pakistan
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.4} />
              <a href="tel:03071763763" className="transition hover:text-primary">
                0307 1763763
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} Faiza Amjad Studio
      </div>
    </footer>
  );
}