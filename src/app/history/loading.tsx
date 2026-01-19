// ============================================
// Loading state pour l'historique
// ============================================

import { Container, Header, Main } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <Container>
      <Header>
        <Skeleton className="h-7 w-32" />
      </Header>
      <Main>
        {/* Workout cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </Main>
    </Container>
  );
}
