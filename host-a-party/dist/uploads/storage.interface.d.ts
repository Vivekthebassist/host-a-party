export interface StorageProvider {
    upload(file: Express.Multer.File, folder: string): Promise<string>;
    delete(fileUrl: string): Promise<void>;
    getUrl(key: string): string;
}
export declare const STORAGE_PROVIDER = "STORAGE_PROVIDER";
