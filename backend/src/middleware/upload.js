const fs = require('fs');
const path = require('path');
const multer = require('multer');

function ensureDirectoryExists(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const userId = req.user?.id || 'guest';
    const destinationPath = path.join(__dirname, '..', '..', 'uploads', 'resumes', String(userId));
    ensureDirectoryExists(destinationPath);
    cb(null, destinationPath);
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.originalname);
    cb(null, `${timestamp}-${safeName}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed'));
    return;
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  upload,
  ensureDirectoryExists,
};