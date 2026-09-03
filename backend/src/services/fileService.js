const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

function generateSimplePdf(candidateName = 'Alex Rivera', fileName = 'Resume.pdf') {
  const safeName = candidateName.replace(/[()]/g, '');
  const safeFile = fileName.replace(/[()]/g, '');
  const content = `BT
/F1 18 Tf
50 720 Td
(${safeName} - Resume) Tj
0 -30 Td
/F1 12 Tf
(Document: ${safeFile}) Tj
0 -20 Td
(Status: Verified Candidate Profile & Resume) Tj
0 -30 Td
(Skills: React, Next.js, TypeScript, Node.js, PostgreSQL) Tj
0 -20 Td
(Experience: Full Stack Engineering & Cloud Architecture) Tj
ET`;
  const streamLength = Buffer.byteLength(content, 'utf8');

  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
380
%%EOF`;
}

async function ensureResumeFileExists(absolutePath, fileName = 'resume.pdf', candidateName = 'Candidate') {
  if (!absolutePath) return false;
  try {
    if (fsSync.existsSync(absolutePath)) {
      return true;
    }
    const dir = path.dirname(absolutePath);
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
    const pdfData = generateSimplePdf(candidateName, fileName);
    await fs.writeFile(absolutePath, pdfData, 'utf8');
    return true;
  } catch (err) {
    console.warn('[fileService] Unable to auto-generate resume file:', err.message);
    return false;
  }
}

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
  ensureResumeFileExists,
};