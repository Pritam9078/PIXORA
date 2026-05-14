/**
 * Robustly converts various YouTube URL formats into an embed-compatible URL.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Links with additional parameters (&t=, &feature=, etc.)
 */
export const getYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  let videoId = '';
  
  try {
    if (url.includes('youtube.com/watch?v=')) {
      const parts = url.split('watch?v=');
      if (parts[1]) {
        videoId = parts[1].split('&')[0];
      }
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    } else if (url.includes('youtube.com/embed/')) {
      const parts = url.split('embed/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    } else if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('shorts/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
  }
  
  if (videoId) {
    // rel=0 ensures related videos are from the same channel
    // modestbranding=1 removes the YouTube logo from the control bar
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  
  // Return the original URL if it's not a recognized YouTube format
  // or if parsing failed, as it might be a direct video link or another platform
  return url;
};
