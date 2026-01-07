import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const MAX_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || String(5 * 1024 * 1024), 10); // default 5MB

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: MAX_SIZE } });

/**
 * @openapi
 * /uploads:
 *   post:
 *     summary: Upload an image file
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded
 */
import { uploadFile } from '../controllers/upload.controller.js';

router.post('/', (req, res, next) => {
  // Accept either 'file' or 'image' field names for compatibility with clients
  const handler = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]);
  handler(req, res, (err) => {
    if (err) return next(err);
    // Normalize to req.file for controller compatibility
    if (!req.file && req.files) {
      if (req.files.file && req.files.file.length) req.file = req.files.file[0];
      else if (req.files.image && req.files.image.length) req.file = req.files.image[0];
    }
    uploadFile(req, res, next);
  });
});

// Compatibility: accept POST /uploads/:name (allows clients that post to /uploads/<filename>)
const storageWithName = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const requested = req.params?.name || '';
    // sanitize base name and keep or infer extension
    const safeBase = path.basename(requested, path.extname(requested)).replace(/[^a-zA-Z0-9-_\.]/g, '-');
    const extFromReq = path.extname(requested);
    const ext = extFromReq || path.extname(file.originalname) || '';
    const name = safeBase ? `${safeBase}${ext}` : `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const uploadWithName = multer({ storage: storageWithName, fileFilter: imageFileFilter, limits: { fileSize: MAX_SIZE } });

router.post('/:name', (req, res, next) => {
  const handler = uploadWithName.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]);
  handler(req, res, (err) => {
    if (err) return next(err);
    if (!req.file && req.files) {
      if (req.files.file && req.files.file.length) req.file = req.files.file[0];
      else if (req.files.image && req.files.image.length) req.file = req.files.image[0];
    }
    uploadFile(req, res, next);
  });
});

export default router;