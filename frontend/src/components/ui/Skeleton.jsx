export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export function StatSkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-24" />
      <Skeleton className="mt-4 h-3 w-36" />
    </div>
  );
}
