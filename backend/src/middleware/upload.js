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
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  
  const allowedMimeTypes = [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'application/vnd.pdf',
    'text/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
    'text/rtf',
    'text/plain',
    'application/octet-stream',
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only PDF, Word (.doc, .docx), RTF, or text documents are allowed');
    error.statusCode = 400;
    cb(error);
  }
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