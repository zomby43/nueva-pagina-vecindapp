'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches
 * @param {string} query - The media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} - True if the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener function
    const listener = (e) => setMatches(e.matches);

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common use cases
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 991px)');
}

export function useIsTablet() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsSmallMobile() {
  return useMediaQuery('(max-width: 576px)');
}

export function useIsExtraSmall() {
  return useMediaQuery('(max-width: 400px)');
}
