import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  fill,
  priority,
  sizes,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Check if it's an S3 image that might have CORS issues
  const isS3Image = src.includes('s3.amazonaws.com') || src.includes('s3.ap-south-1.amazonaws.com');
  const proxiedSrc = isS3Image ? `/api/image-proxy?url=${encodeURIComponent(src)}` : src;

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Use a placeholder image
      setImgSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+');
    }
  };

  if (fill) {
    return (
      <Image
        src={proxiedSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={proxiedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={handleError}
    />
  );
}
