export interface StorageProvider {
  upload(file: Express.Multer.File, folder: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
  getUrl(key: string): string;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
