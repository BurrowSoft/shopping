interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, reviewCount, size = "md" }: StarRatingProps) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const starClass = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-1">
      <span className={`${starClass} text-amber-400`} aria-hidden>
        {"★".repeat(full)}
        {hasHalf ? "½" : ""}
        <span className="text-slate-200">{"★".repeat(empty)}</span>
      </span>
      <span className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-slate-700`}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={`${size === "sm" ? "text-xs" : "text-sm"} text-slate-400`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
