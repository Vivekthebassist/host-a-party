import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { StorageProvider } from './storage.interface';

/**
 * Local disk storage provider.
 * Stores files in ./uploads/<folder>/<filename>
 * Serves them via /uploads/<folder>/<filename>
 *
 * To swap to S3: create an S3StorageProvider implementing StorageProvider
 * and change the provider binding in UploadsModule.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    const port = this.config.get('PORT') || 3000;
    this.baseUrl = this.config.get('UPLOAD_BASE_URL') || `http://localhost:${port}/uploads`;
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const folderPath = path.join(this.uploadDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(folderPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    return `${this.baseUrl}/${folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.replace(this.baseUrl + '/', '');
    const filePath = path.join(this.uploadDir, relativePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
