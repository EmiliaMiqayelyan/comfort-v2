import { MediaAsset } from '../../shared/database/models';
import { generateId } from '../../shared/utils/uuid';
import { detectMediaType } from '../../shared/utils/mediaType';
import { optimizeUploadedImage } from '../../shared/utils/optimizeImage';

export class MediaService {
  async list() {
    return MediaAsset.findAll({ order: [['createdAt', 'DESC']] });
  }

  async createFromUpload(file: Express.Multer.File) {
    const optimized = await optimizeUploadedImage(file);
    const id = generateId();
    const type = detectMediaType(optimized.mimetype, optimized.originalname);
    const url = `/uploads/${optimized.filename}`;
    return MediaAsset.create({
      id,
      name: optimized.originalname,
      type,
      url,
      folder: null,
      size: optimized.size,
    });
  }
}

export const mediaService = new MediaService();
