import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RecipeCardSkeleton() {
    return (
        <Card className="card-base overflow-hidden h-full flex flex-col">
            <div className="relative h-48 w-full bg-muted">
                <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
                <div className="flex items-center gap-1 w-full">
                    <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-1 w-full">
                    <Skeleton className="h-3 w-16" />
                </div>
                <div className="mt-1 flex justify-between items-center w-full">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                </div>
            </CardFooter>
        </Card>
    )
}
