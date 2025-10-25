// Global image error handler to prevent console errors
export const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img && img.src) {
    console.log(`Image failed to load: ${img.src}`);
    // Replace with placeholder
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
    img.alt = 'Image failed to load';
  }
};

// Add global error handler for all images
if (typeof window !== 'undefined') {
  document.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) {
      handleImageError(event);
    }
  }, true);
}

