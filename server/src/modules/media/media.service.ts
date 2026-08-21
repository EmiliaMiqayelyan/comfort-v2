import { MediaAsset } from '../../shared/database/models';
import { generateId } from '../../shared/utils/uuid';
import { detectMediaType } from '../../shared/utils/mediaType';

export class MediaService {
  async list() {
    return MediaAsset.findAll({ order: [['createdAt', 'DESC']] });
  }

  async createFromUpload(file: Express.Multer.File) {
    const id = generateId();
    const type = detectMediaType(file.mimetype, file.originalname);
    const url = `/uploads/${file.filename}`;
    return MediaAsset.create({
      id,
      name: file.originalname,
      type,
      url,
      folder: null,
      size: file.size,
    });
  }
}

export const mediaService = new MediaService();
