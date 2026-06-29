import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col noir-grain">
      <Nav />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
