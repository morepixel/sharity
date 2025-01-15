const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Function to download image and convert to base64 with compression
const downloadImageAsBase64 = (url, maxWidth = 800) => {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          
          // Compress and resize image
          const processedBuffer = await sharp(buffer)
            .resize(maxWidth, null, { // null maintains aspect ratio
              withoutEnlargement: true
            })
            .jpeg({
              quality: 60, // Reduce quality to decrease file size
              progressive: true
            })
            .toBuffer();

          const base64 = processedBuffer.toString('base64');
          const size = Math.round(base64.length / 1024); // Size in KB
          console.log(`Processed image size: ${size}KB`);
          
          resolve(`data:image/jpeg;base64,${base64}`);
        } catch (error) {
          reject(error);
        }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
};

// Sample images from Unsplash with direct JPEG URLs
const sampleImages = {
  sofa1: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&fm=jpg&fit=crop',
  sofa2: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800&fm=jpg&fit=crop',
  iphone1: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&fm=jpg&fit=crop',
  iphone2: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&fm=jpg&fit=crop',
  bike1: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&fm=jpg&fit=crop',
  bike2: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&fm=jpg&fit=crop'
};

// User profile images - smaller size for profile pics
const userImages = {
  max: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fm=jpg&fit=crop',
  erika: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fm=jpg&fit=crop',
  tom: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&fm=jpg&fit=crop'
};

// Save base64 images to JSON file
async function createImages() {
  try {
    console.log('Starting image downloads...');
    const images = {
      listings: {},
      users: {}
    };

    // Download listing images
    for (const [name, url] of Object.entries(sampleImages)) {
      console.log(`Downloading ${name} from ${url}`);
      const base64 = await downloadImageAsBase64(url, 800); // Max width 800px for listings
      images.listings[name] = base64;
      console.log(`Downloaded ${name} image`);
    }

    // Download user profile images
    for (const [name, url] of Object.entries(userImages)) {
      console.log(`Downloading ${name} profile from ${url}`);
      const base64 = await downloadImageAsBase64(url, 200); // Max width 200px for profiles
      images.users[name] = base64;
      console.log(`Downloaded ${name} profile image`);
    }

    // Save to JSON file
    const imagesFile = path.join(__dirname, '../data/images.json');
    const imagesDir = path.dirname(imagesFile);
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
    console.log('All images downloaded and saved to images.json');
  } catch (error) {
    console.error('Error downloading images:', error);
    process.exit(1);
  }
}

createImages();
