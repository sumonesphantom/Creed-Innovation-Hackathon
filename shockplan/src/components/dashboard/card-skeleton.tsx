interface CardSkeletonProps {
    lines?: number;
    height?: string;
}

export function CardSkeleton({
    lines = 3,
    height = "h-2.5",
}: CardSkeletonProps) {
    return (
        <div className="space-y-3.5 w-full animate-pulse">
            {Array.from({ length: lines }, (_, i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/6" />
                    </div>
                    <div className={`${height} bg-muted rounded-full w-full`} />
                </div>
            ))}
        </div>
    );
}
