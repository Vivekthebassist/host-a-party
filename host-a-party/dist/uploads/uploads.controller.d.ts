import { UploadsService, UploadFolder } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    upload(file: Express.Multer.File, folder: UploadFolder): Promise<{
        url: string;
    }>;
}
