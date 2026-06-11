import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { StorageProvider, STORAGE_PROVIDER } from './storage.interface';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadFolder = 'avatars' | 'events' | 'id-proofs' | 'chat';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
  ) {}

  async uploadImage(file: Express.Multer.File, folder: UploadFolder): Promise<{ url: string }> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must be under 5MB');
    }

    const url = await this.storage.upload(file, folder);
    return { url };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    await this.storage.delete(fileUrl);
  }
}
