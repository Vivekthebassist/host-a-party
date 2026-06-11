import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.interface';
export declare class LocalStorageProvider implements StorageProvider {
    private readonly config;
    private readonly uploadDir;
    private readonly baseUrl;
    constructor(config: ConfigService);
    upload(file: Express.Multer.File, folder: string): Promise<string>;
    delete(fileUrl: string): Promise<void>;
    getUrl(key: string): string;
}
