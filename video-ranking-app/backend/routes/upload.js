const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, and WEBM allowed.'));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Helper: Get video duration using FFprobe
async function getVideoDuration(filePath) {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (err) {
    console.error('Error getting duration:', err);
    return 3; // Default fallback
  }
}

// Helper: Generate thumbnail
async function generateThumbnail(videoPath, outputPath) {
  try {
    await execPromise(
      `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=120:-1" "${outputPath}"`
    );
    return true;
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    return false;
  }
}

// Upload route
router.post('/', upload.array('videos', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileData = await Promise.all(
      files.map(async (file) => {
        const duration = await getVideoDuration(file.path);
        
        // Generate thumbnail
        const thumbPath = path.join(
          __dirname,
          '../uploads',
          `thumb_${file.filename}.jpg`
        );
        await generateThumbnail(file.path, thumbPath);

        return {
          filename: file.originalname,
          path: `/uploads/${file.filename}`,
          duration,
          thumbnail: `/uploads/thumb_${file.filename}.jpg`
        };
      })
    );

    res.json({ success: true, files: fileData });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
