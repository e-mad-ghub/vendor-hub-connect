import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  showCount = true,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={`${sizeClasses[size]} fill-marketplace-rating text-marketplace-rating`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${sizeClasses[size]} fill-marketplace-rating text-marketplace-rating`} />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-muted-foreground/30`} />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
};
