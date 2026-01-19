// ============================================
// Loading state pour la liste des sessions
// ============================================

import { Container, Header, Main } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsLoading() {
  return (
    <Container>
      <Header>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </Header>
      <Main>
        {/* Session cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </Main>
    </Container>
  );
}
