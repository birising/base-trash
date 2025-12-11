#!/usr/bin/env node

/**
 * Interaktivní skript pro nahrávání obrázků závad
 * - Extrahuje GPS souřadnice z EXIF dat
 * - Ptá se na kategorii
 * - Generuje UUID pro název souboru
 * - Přidá záznam do zavady.json
 * - Vygeneruje thumbnail
 * - Commitne a pushne na git
 * 
 * Použití: node scripts/upload-image.js <cesta-k-obrazku>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Chyba: sharp není nainstalován. Nainstalujte ho pomocí: npm install sharp');
  process.exit(1);
}

// Check if exif-parser is available
let exifParser;
try {
  exifParser = require('exif-parser');
} catch (e) {
  console.warn('⚠️  exif-parser není nainstalován. GPS souřadnice budou muset být zadány ručně.');
  console.warn('   Pro instalaci: npm install exif-parser');
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const THUMBS_DIR = path.join(ASSETS_DIR, 'thumbs');
const ZAVADY_FILE = path.join(__dirname, '..', 'data', 'zavady.json');

// Kategorie pro výběr
const CATEGORIES = {
  '1': { value: 'zelen', label: 'Zelen' },
  '2': { value: 'udrzba zelene', label: 'Údržba zeleně' },
  '3': { value: 'kose', label: 'Koš' },
  '4': { value: 'lampy', label: 'Lampa' },
  '5': { value: 'ostatni', label: 'Ostatní' }
};

// Helper functions
function generateUUID() {
  return require('crypto').randomUUID().toLowerCase();
}

function formatDate(date) {
  return date.toISOString().replace('T', 'T').split('.')[0] + 'Z';
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Extract GPS from EXIF
async function extractGPS(imagePath) {
  try {
    // Try exif-parser if available
    if (exifParser) {
      const buffer = fs.readFileSync(imagePath);
      const parser = exifParser.create(buffer);
      const result = parser.parse();
      
      if (result.tags && result.tags.GPSLatitude && result.tags.GPSLongitude) {
        const lat = result.tags.GPSLatitude;
        const lng = result.tags.GPSLongitude;
        const latRef = result.tags.GPSLatitudeRef || 'N';
        const lngRef = result.tags.GPSLongitudeRef || 'E';
        
        return {
          lat: latRef === 'S' ? -lat : lat,
          lng: lngRef === 'W' ? -lng : lng,
          source: 'EXIF'
        };
      }
    }
    
    // Try sharp metadata (some formats might have GPS)
    const metadata = await sharp(imagePath).metadata();
    if (metadata.exif) {
      console.log('ℹ️  EXIF data nalezena, ale GPS souřadnice nejsou dostupné přímo');
    }
    
    return null;
  } catch (error) {
    console.error('⚠️  Chyba při extrakci GPS:', error.message);
    return null;
  }
}

// Generate thumbnail
async function generateThumbnail(inputPath, outputPath) {
  try {
    const thumbDir = path.dirname(outputPath);
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }
    
    await sharp(inputPath)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error('❌ Chyba při generování thumbnailu:', error.message);
    return false;
  }
}

// Add entry to zavady.json
function addZavadaEntry(category, lat, lng, description, imagePath) {
  try {
    const data = JSON.parse(fs.readFileSync(ZAVADY_FILE, 'utf8'));
    
    // Find next ID
    const nextId = data.length > 0 
      ? Math.max(...data.map(z => z.id)) + 1 
      : 1;
    
    const newEntry = {
      id: nextId,
      reported_date: formatDate(new Date()),
      category: category,
      lat: lat,
      lng: lng,
      description: description,
      resolved: false,
      resolved_date: null,
      email: null,
      photos: [imagePath]
    };
    
    data.push(newEntry);
    
    // Write back to file
    fs.writeFileSync(ZAVADY_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
    
    return nextId;
  } catch (error) {
    console.error('❌ Chyba při přidávání záznamu:', error.message);
    throw error;
  }
}

// Git operations
function gitAdd(files) {
  try {
    execSync(`git add ${files.join(' ')}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Chyba při git add:', error.message);
    return false;
  }
}

function gitCommit(message) {
  try {
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Chyba při git commit:', error.message);
    return false;
  }
}

function gitPush() {
  try {
    execSync('git push', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Chyba při git push:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Použití: node scripts/upload-image.js <cesta-k-obrazku>');
    process.exit(1);
  }
  
  const imagePath = path.resolve(args[0]);
  
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Soubor neexistuje: ${imagePath}`);
    process.exit(1);
  }
  
  console.log(`\n📸 Nahrávání obrázku: ${path.basename(imagePath)}\n`);
  
  // Extract GPS coordinates
  console.log('🔍 Extrahuji GPS souřadnice z EXIF dat...');
  const gpsData = await extractGPS(imagePath);
  
  const rl = createReadlineInterface();
  
  try {
    // Get category
    console.log('\n📋 Vyberte kategorii:');
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      console.log(`   ${key}. ${cat.label}`);
    });
    
    let categoryChoice = await question(rl, '\nKategorie (1-5): ');
    while (!CATEGORIES[categoryChoice]) {
      categoryChoice = await question(rl, 'Neplatná volba. Zadejte číslo 1-5: ');
    }
    const category = CATEGORIES[categoryChoice].value;
    
    // Get GPS coordinates
    let lat, lng;
    if (gpsData) {
      console.log(`\n✅ GPS souřadnice nalezeny v EXIF: ${gpsData.lat}, ${gpsData.lng}`);
      const useGPS = await question(rl, 'Použít tyto souřadnice? (a/n): ');
      if (useGPS.toLowerCase() === 'a' || useGPS.toLowerCase() === 'y') {
        lat = gpsData.lat;
        lng = gpsData.lng;
      } else {
        lat = parseFloat(await question(rl, 'Zadejte zeměpisnou šířku (lat): '));
        lng = parseFloat(await question(rl, 'Zadejte zeměpisnou délku (lng): '));
      }
    } else {
      console.log('\n⚠️  GPS souřadnice nebyly nalezeny v EXIF datech.');
      lat = parseFloat(await question(rl, 'Zadejte zeměpisnou šířku (lat): '));
      lng = parseFloat(await question(rl, 'Zadejte zeměpisnou délku (lng): '));
    }
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Neplatné GPS souřadnice');
      process.exit(1);
    }
    
    // Get description
    const description = await question(rl, 'Popis závady: ');
    
    if (!description || description.trim() === '') {
      console.error('❌ Popis je povinný');
      process.exit(1);
    }
    
    rl.close();
    
    // Generate UUID and copy file
    const uuid = generateUUID();
    const ext = path.extname(imagePath).toLowerCase() || '.jpg';
    const newFileName = `image-${uuid}${ext}`;
    const newFilePath = path.join(ASSETS_DIR, newFileName);
    const relativeImagePath = `assets/${newFileName}`;
    
    console.log(`\n📁 Kopíruji obrázek jako: ${newFileName}`);
    fs.copyFileSync(imagePath, newFilePath);
    
    // Generate thumbnail
    console.log('🖼️  Generuji thumbnail...');
    const thumbPath = path.join(THUMBS_DIR, newFileName);
    await generateThumbnail(newFilePath, thumbPath);
    
    // Add to zavady.json
    console.log('📝 Přidávám záznam do zavady.json...');
    const entryId = addZavadaEntry(category, lat, lng, description.trim(), relativeImagePath);
    console.log(`✅ Záznam přidán s ID: ${entryId}`);
    
    // Git operations
    console.log('\n🔧 Git operace...');
    const gitAddSuccess = gitAdd([relativeImagePath, `assets/thumbs/${newFileName}`, 'data/zavady.json']);
    
    if (gitAddSuccess) {
      const commitMessage = `Přidání závady: ${description.trim()} (${category})`;
      const gitCommitSuccess = gitCommit(commitMessage);
      
      if (gitCommitSuccess) {
        console.log('\n🚀 Pushnu změny na GitHub...');
        const pushSuccess = gitPush();
        
        if (pushSuccess) {
          console.log('\n✅ Hotovo! Obrázek byl úspěšně nahrán a commitnut.');
          console.log(`   ID závady: ${entryId}`);
          console.log(`   Obrázek: ${relativeImagePath}`);
          console.log(`   Thumbnail: assets/thumbs/${newFileName}`);
        } else {
          console.log('\n⚠️  Commit byl vytvořen, ale push selhal. Zkuste pushnout ručně: git push');
        }
      } else {
        console.log('\n⚠️  Soubory byly přidány do git, ale commit selhal.');
      }
    } else {
      console.log('\n⚠️  Git add selhal. Zkuste commitnout ručně.');
    }
    
  } catch (error) {
    rl.close();
    console.error('\n❌ Chyba:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatální chyba:', error);
  process.exit(1);
});

