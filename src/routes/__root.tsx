import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <div className="text-xs font-bold tracking-widest uppercase text-gold mb-3">404</div>
        <h1 className="font-display text-5xl font-bold text-burgundy">Page not found</h1>
        <p className="mt-4 text-ink/60">The page you're looking for has moved or never existed.</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-burgundy px-6 py-3 text-sm font-bold text-white uppercase tracking-widest hover:bg-wine transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-bold text-burgundy">Something interrupted the press</h1>
        <p className="mt-3 text-sm text-ink/60">Try again — if it keeps happening, head home and we'll dispatch a specialist.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-burgundy px-5 py-2.5 text-sm font-bold text-white hover:bg-wine transition-colors"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-burgundy/20 px-5 py-2.5 text-sm font-bold text-burgundy hover:bg-burgundy/5 transition-colors">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Metier — Premium Print Atelier" },
      { name: "description", content: "Metier crafts tactile business cards, marketing materials, packaging, and invitations for discerning brands." },
      { name: "author", content: "Metier Print Atelier" },
      { property: "og:site_name", content: "Metier" },
      { property: "og:title", content: "Metier — Premium Print Atelier" },
      { property: "og:description", content: "Tactile printing for discerning brands. Cotton stocks, foil, letterpress, packaging." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <div className="min-h-screen flex flex-col bg-cream text-ink">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <WhatsAppButton />
            <Toaster />
          </div>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
