'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'custom';
  width?: string;
  height?: string;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'skeleton';

  const variantClasses = {
    text: 'skeleton-text',
    title: 'skeleton-title',
    avatar: 'skeleton-avatar',
    card: 'skeleton-card',
    custom: '',
  };

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-composed skeleton layouts for common patterns
export function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-card">
      <div className="flex items-start gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="title" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="75%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonReportCard() {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-card">
      <Skeleton variant="custom" width="60px" height="20px" className="mb-3 rounded-full" />
      <Skeleton variant="title" className="mb-2" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="85%" />
      <Skeleton variant="text" width="70%" className="mb-4" />
      <div className="flex gap-3">
        <Skeleton variant="custom" width="80px" height="16px" />
        <Skeleton variant="custom" width="60px" height="16px" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="avatar" />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonArticle() {
  return (
    <div className="max-w-prose mx-auto">
      <Skeleton variant="custom" width="100px" height="24px" className="mb-4 rounded-full" />
      <Skeleton variant="custom" width="80%" height="48px" className="mb-6" />
      <Skeleton variant="text" width="40%" className="mb-8" />
      <div className="space-y-4">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="75%" />
      </div>
    </div>
  );
}
