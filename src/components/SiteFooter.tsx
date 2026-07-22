import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl tracking-[0.25em] text-primary">FAIZA AMJAD</p>
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
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} Faiza Amjad Studio
      </div>
    </footer>
  );
}