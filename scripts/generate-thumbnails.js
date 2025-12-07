#!/usr/bin/env node

/**
 * Script to generate thumbnails for zavady photos
 * Requires: sharp (npm install sharp)
 * Usage: node scripts/generate-thumbnails.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed. Install it with: npm install sharp');
  process.exit(1);
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const THUMBS_DIR = path.join(ASSETS_DIR, 'thumbs');
const THUMBNAIL_SIZE = 200; // Max width/height for thumbnails

// Create thumbs directory if it doesn't exist
if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
  console.log('Created thumbs directory:', THUMBS_DIR);
}

// Get all image files from assets directory
function getImageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'thumbs') {
      // Recursively search subdirectories
      files.push(...getImageFiles(fullPath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Generate thumbnail for an image
async function generateThumbnail(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error(`Error generating thumbnail for ${inputPath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('Assets directory not found:', ASSETS_DIR);
    process.exit(1);
  }
  
  console.log('Scanning for images in:', ASSETS_DIR);
  const imageFiles = getImageFiles(ASSETS_DIR);
  console.log(`Found ${imageFiles.length} image files`);
  
  if (imageFiles.length === 0) {
    console.log('No images found. Exiting.');
    return;
  }
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const imagePath of imageFiles) {
    const relativePath = path.relative(ASSETS_DIR, imagePath);
    const thumbPath = path.join(THUMBS_DIR, relativePath);
    const thumbDir = path.dirname(thumbPath);
    
    // Create subdirectory if needed
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }
    
    // Skip if thumbnail already exists and is newer than original
    if (fs.existsSync(thumbPath)) {
      const imageStat = fs.statSync(imagePath);
      const thumbStat = fs.statSync(thumbPath);
      if (thumbStat.mtime >= imageStat.mtime) {
        skipCount++;
        continue;
      }
    }
    
    console.log(`Generating thumbnail: ${relativePath}`);
    const success = await generateThumbnail(imagePath, thumbPath);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Generated: ${successCount}`);
  console.log(`Skipped (already exists): ${skipCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${imageFiles.length}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

