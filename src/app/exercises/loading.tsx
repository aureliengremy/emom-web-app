// ============================================
// Loading state pour la liste des exercices
// ============================================

import { Container, Header, Main } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisesLoading() {
  return (
    <Container>
      <Header>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </Header>
      <Main>
        {/* Search skeleton */}
        <Skeleton className="mb-4 h-10 w-full" />

        {/* Category tabs skeleton */}
        <div className="mb-4 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>

        {/* Exercise cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </Main>
    </Container>
  );
}
