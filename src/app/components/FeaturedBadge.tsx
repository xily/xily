interface FeaturedBadgeProps {
  className?: string;
}

export default function FeaturedBadge({ className = '' }: FeaturedBadgeProps) {
  return (
    <span className={`bg-yellow-300 text-yellow-900 px-2 py-1 rounded text-sm font-medium ${className}`}>
      ⭐ Featured
    </span>
  );
}
