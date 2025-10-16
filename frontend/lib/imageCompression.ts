/**
 * Compress image file and return base64 data URL
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default: 800px)
 * @param maxHeight - Maximum height (default: 600px)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Promise<string> - Compressed base64 data URL
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Check if localStorage has enough space for a value
 * @param key - Storage key
 * @param value - Value to store
 * @returns boolean - True if enough space
 */
export const hasStorageSpace = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return false;
    }
    throw e;
  }
};

/**
 * Get current localStorage usage
 * @returns object with used and total bytes
 */
export const getStorageUsage = (): { used: number; total: number; usedMB: number; totalMB: number } => {
  let used = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }
  
  // Most browsers have 5-10MB limit
  const total = 5 * 1024 * 1024; // Assume 5MB
  
  return {
    used,
    total,
    usedMB: parseFloat((used / (1024 * 1024)).toFixed(2)),
    totalMB: parseFloat((total / (1024 * 1024)).toFixed(2))
  };
};

/**
 * Clear old drafts if storage is running low
 * @param threshold - Percentage threshold (default: 0.8 = 80%)
 */
export const clearStorageIfNeeded = (threshold: number = 0.8): void => {
  const { used, total } = getStorageUsage();
  const usagePercentage = used / total;
  
  if (usagePercentage > threshold) {
    console.warn(`Storage usage at ${(usagePercentage * 100).toFixed(1)}%. Clearing old drafts...`);
    
    // Clear image storage first (usually the largest)
    localStorage.removeItem('donation_event_images');
    
    // If still over threshold, clear form draft too
    const { used: newUsed } = getStorageUsage();
    if (newUsed / total > threshold) {
      localStorage.removeItem('donation_event_draft');
    }
  }
};
