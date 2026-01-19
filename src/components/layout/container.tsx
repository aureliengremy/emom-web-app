// ============================================
// Container - Layout mobile-first
// ============================================

import { cn } from "@/lib/utils";

// Skip link pour l'accessibilité (visible uniquement au focus)
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
    >
      Aller au contenu principal
    </a>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Padding horizontal */
  padded?: boolean;
  /** Centrer le contenu avec max-width */
  centered?: boolean;
  /** Largeur étendue pour desktop (max-w-4xl au lieu de max-w-lg) */
  wide?: boolean;
}

export function Container({
  children,
  className,
  padded = true,
  centered = true,
  wide = false,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full",
        padded && "px-4",
        centered && (wide ? "mx-auto max-w-lg md:max-w-4xl" : "mx-auto max-w-lg"),
        className
      )}
    >
      <SkipLink />
      {children}
    </div>
  );
}

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between bg-background/80 py-4 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </header>
  );
}

interface MainProps {
  children: React.ReactNode;
  className?: string;
}

export function Main({ children, className }: MainProps) {
  return (
    <main id="main-content" className={cn("flex-1 pb-24", className)}>
      {children}
    </main>
  );
}
