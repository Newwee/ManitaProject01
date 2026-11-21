/**
 * MANITA Studio - Image Compression Utility
 * Limits file size to <= 1000KB, warns if > 5MB,
 * and compresses automatically via HTML5 Canvas.
 */

export const MAX_ALLOWED_INPUT_SIZE = 5 * 1024 * 1024; // 5 MB
export const TARGET_MAX_OUTPUT_SIZE = 1000 * 1024; // 1000 KB

export async function compressImageFile(file) {
  if (!file) throw new Error("No file provided");

  const originalSize = file.size;
  const originalSizeKB = Math.round(originalSize / 1024);

  if (originalSize > MAX_ALLOWED_INPUT_SIZE) {
    console.warn(`File exceeds 5MB (${originalSizeKB} KB). Auto-compressing down to under 1000KB...`);
  }

  // If GIF or PNG is already within limit (<= 1000KB), preserve raw data to keep animation & transparency
  const isGif = file.type === 'image/gif' || file.name?.toLowerCase().endsWith('.gif');
  const isPng = file.type === 'image/png' || file.name?.toLowerCase().endsWith('.png');

  if ((isGif || isPng) && originalSize <= TARGET_MAX_OUTPUT_SIZE) {
    const rawDataUrl = await readFileAsDataURL(file);
    return {
      dataUrl: rawDataUrl,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      ratio: 0
    };
  }

  // Load image into HTMLImageElement
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  // Determine appropriate dimensions (max 1280px on longest side for optimal mobile speed & memory)
  const maxDimension = 1280;
  let width = img.width;
  let height = img.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill with white background (in case of PNG transparency converting to JPEG)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Iteratively reduce quality if needed to ensure strictly <= 1000KB
  let quality = 0.86;
  let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  let compressedBytes = getBase64ByteLength(compressedDataUrl);

  while (compressedBytes > TARGET_MAX_OUTPUT_SIZE && quality > 0.3) {
    quality -= 0.12;
    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    compressedBytes = getBase64ByteLength(compressedDataUrl);
  }

  // If still too large, downscale canvas dimensions
  if (compressedBytes > TARGET_MAX_OUTPUT_SIZE) {
    canvas.width = Math.round(width * 0.7);
    canvas.height = Math.round(height * 0.7);
    const ctx2 = canvas.getContext('2d');
    ctx2.fillStyle = '#FFFFFF';
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
    compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
    compressedBytes = getBase64ByteLength(compressedDataUrl);
  }

  const compressedSizeKB = Math.round(compressedBytes / 1024);

  return {
    dataUrl: compressedDataUrl,
    originalSizeKB,
    compressedSizeKB,
    ratio: Math.round(((originalSize - compressedBytes) / originalSize) * 100)
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getBase64ByteLength(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4);
}
