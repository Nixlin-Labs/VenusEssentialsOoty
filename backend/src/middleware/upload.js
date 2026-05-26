const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directories exist
const uploadDirs = ['products', 'banners', 'categories', 'cms', 'avatars', 'invoices'];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', '..', env.UPLOAD_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Multer storage (memory for Sharp processing)
const storage = multer.memoryStorage();

// File filter — images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and AVIF images are allowed'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 10,
  },
});

/**
 * Process uploaded image — compress and save.
 * @param {Buffer} buffer - Image buffer
 * @param {string} subDir - Subdirectory under uploads
 * @param {string} filename - Output filename (without extension)
 * @param {object} options - Processing options
 * @returns {object} - { url, thumbnail }
 */
const processImage = async (buffer, subDir, filename, options = {}) => {
  const {
    width = 1200,
    height = 1200,
    quality = 80,
    thumbnailWidth = 400,
    thumbnailHeight = 400,
    fit = 'inside',
  } = options;

  const outputDir = path.join(__dirname, '..', '..', env.UPLOAD_DIR, subDir);
  const ext = '.webp';

  // Main image
  const mainFilename = `${filename}${ext}`;
  const mainPath = path.join(outputDir, mainFilename);
  await sharp(buffer)
    .resize(width, height, { fit, withoutEnlargement: true })
    .webp({ quality })
    .toFile(mainPath);

  // Thumbnail
  const thumbFilename = `${filename}_thumb${ext}`;
  const thumbPath = path.join(outputDir, thumbFilename);
  await sharp(buffer)
    .resize(thumbnailWidth, thumbnailHeight, { fit: 'cover' })
    .webp({ quality: 70 })
    .toFile(thumbPath);

  return {
    url: `/${env.UPLOAD_DIR}/${subDir}/${mainFilename}`,
    thumbnail: `/${env.UPLOAD_DIR}/${subDir}/${thumbFilename}`,
  };
};

/**
 * Delete uploaded file.
 */
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '..', '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { upload, processImage, deleteFile };
