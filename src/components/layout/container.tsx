// ============================================
// Container - Layout mobile-first
// ============================================

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Padding horizontal */
  padded?: boolean;
  /** Centrer le contenu avec max-width */
  centered?: boolean;
}

export function Container({
  children,
  className,
  padded = true,
  centered = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full",
        padded && "px-4",
        centered && "mx-auto max-w-lg",
        className
      )}
    >
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
    <main className={cn("flex-1 pb-24", className)}>
      {children}
    </main>
  );
}
