import { useState } from 'react';

interface RecipeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function RecipeImage({
  src,
  alt,
  className,
  loading = 'lazy',
}: RecipeImageProps) {
  const [didError, setDidError] = useState(false);

  return (
    <img
      src={src && !didError ? src : '/recipe-placeholder.svg'}
      alt={alt}
      loading={loading}
      onError={() => setDidError(true)}
      className={className}
    />
  );
}
