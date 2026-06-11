import { StorageProvider } from './storage.interface';
export type UploadFolder = 'avatars' | 'events' | 'id-proofs' | 'chat';
export declare class UploadsService {
    private readonly storage;
    constructor(storage: StorageProvider);
    uploadImage(file: Express.Multer.File, folder: UploadFolder): Promise<{
        url: string;
    }>;
    deleteFile(fileUrl: string): Promise<void>;
}
