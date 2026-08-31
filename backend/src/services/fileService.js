const fs = require('fs/promises');
const path = require('path');

async function deleteLocalFile(filePath) {
  if (!filePath) {
    return false;
  }

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

function buildResumePath(userId, fileName) {
  return path.join('uploads', 'resumes', String(userId), fileName);
}

module.exports = {
  deleteLocalFile,
  buildResumePath,
};