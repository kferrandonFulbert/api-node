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
/*
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
*/
// Compatibility: accept POST /uploads/:name (allows clients that post to /uploads/<filename>)
/**
 * Multer disk storage configuration for handling file uploads.
 * 
 * Configures where uploaded files are stored and how they are named.
 * 
 * @type {multer.StorageEngine}
 * 
 * @description
 * - **destination**: Files are saved to the `uploadDir` directory
 * - **filename**: Generated filename follows these rules:
 *   1. Extracts the base name and extension from `req.params.name` (if provided)
 *   2. Sanitizes the base name by replacing invalid characters with hyphens
 *   3. Uses the extension from the request parameter if available
 *   4. Falls back to the extension from the original uploaded file
 *   5. If no base name is provided, generates a unique filename using timestamp and random string
 *   6. Appends the determined extension to create the final filename
 * 
 * @example
 * // Request with custom name: /upload?name=my-document.pdf
 * // Result: my-document.pdf
 * 
 * @example
 * // Request with invalid characters: /upload?name=my@#$file.txt
 * // Result: my-----file.txt
 * 
 * @example
 * // Request with no custom name
 * // Result: 1704067200000-a7f2k9.pdf (timestamp-random + extension)
 */

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