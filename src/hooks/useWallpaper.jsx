import { useState, useEffect } from 'react';

// This would typically be fetched from your server/API
const getWallpapers = async () => {
  // Instead of random selection, we'll use a specific wallpaper
  return [
    '/wallpaper/kuromi.png',
  ];
};

export const useWallpaper = () => {
  const [wallpaper, setWallpaper] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        setLoading(true);
        const wallpapers = await getWallpapers();
        
        if (wallpapers.length === 0) {
          throw new Error('No wallpapers found');
        }
        
        // Use the specific wallpaper (kuromi.png)
        setWallpaper(wallpapers[0]);
        setError(null);
      } catch (err) {
        console.error('Error loading wallpaper:', err);
        setError(err.message || 'Failed to load wallpaper');
        // Set a default wallpaper or fallback
        setWallpaper('');
      } finally {
        setLoading(false);
      }
    };

    fetchWallpaper();
  }, []);

  const changeWallpaper = async () => {
    // No need to change wallpaper as we're using a specific one
    return;
  };

  return { wallpaper, loading, error, changeWallpaper };
}; 