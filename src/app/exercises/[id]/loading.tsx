// ============================================
// Loading state pour le détail d'un exercice
// ============================================

import { Container, Header, Main } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ExerciseDetailLoading() {
  return (
    <Container>
      <Header>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </Header>

      <Main>
        {/* Stats principales */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Skeleton className="mb-2 h-6 w-6" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="mt-1 h-4 w-16" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Skeleton className="mb-2 h-6 w-6" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="mt-1 h-4 w-16" />
            </CardContent>
          </Card>
        </div>

        {/* Config EMOM */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>

        {/* Graphique */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </Main>
    </Container>
  );
}
