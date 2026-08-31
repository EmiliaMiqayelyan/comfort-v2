import multer from 'multer';
import path from 'path';
import { generateId } from '../../shared/utils/uuid';
import { UPLOADS_DIR } from '../../shared/utils/uploadsPath';

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${generateId()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});
