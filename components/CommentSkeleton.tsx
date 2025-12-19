import { Skeleton } from "@/components/ui/skeleton"

export function CommentSkeleton() {
    return (
        <div className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    )
}
