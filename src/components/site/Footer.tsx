import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-ink text-white/60 py-20 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-display font-bold text-2xl text-white mb-6 tracking-tight">
            METIER<span className="text-gold">.</span>
          </h2>
          <p className="max-w-sm mb-8 leading-relaxed">
            Crafting the world's most tactile stationery, marketing, and packaging for the discerning brand. Est. 1994 — London / NYC.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="size-9 rounded-full border border-white/10 grid place-items-center hover:border-gold hover:text-gold transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="size-9 rounded-full border border-white/10 grid place-items-center hover:border-gold hover:text-gold transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="size-9 rounded-full border border-white/10 grid place-items-center hover:border-gold hover:text-gold transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-6">Shop</h5>
          <ul className="space-y-3 text-sm">
            <li><Link to="/category/$slug" params={{ slug: "business-cards" }} className="hover:text-gold">Business Cards</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "wedding-invitations" }} className="hover:text-gold">Invitations</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "packaging-boxes" }} className="hover:text-gold">Packaging</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "stickers" }} className="hover:text-gold">Stickers</Link></li>
            <li><Link to="/categories" className="hover:text-gold">All Categories</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-6">Company</h5>
          <ul className="space-y-3 text-sm mb-8">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
            <li><Link to="/quote" className="hover:text-gold">Request Quote</Link></li>
          </ul>
          <h5 className="text-white font-bold text-sm mb-3">Newsletter</h5>
          {subscribed ? (
            <p className="text-xs text-gold">Thanks — check your inbox.</p>
          ) : (
            <form
              className="flex border-b border-white/20 pb-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="bg-transparent text-sm w-full focus:outline-none placeholder:text-white/30"
              />
              <button type="submit" className="text-gold text-sm font-bold">JOIN</button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 justify-between text-[11px] tracking-widest uppercase">
        <span>&copy; {new Date().getFullYear()} Metier Print Atelier</span>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-gold">Privacy</Link>
          <Link to="/terms" className="hover:text-gold">Terms</Link>
          <Link to="/refund" className="hover:text-gold">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
