import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingDashboard() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-cream overflow-hidden">
          <CardHeader className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <Card className="glass-cream">
          <CardContent className="grid gap-4 p-6">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card className="glass-cream" key={index}>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="glass-cream xl:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card className="glass-cream">
          <CardContent className="p-6">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
