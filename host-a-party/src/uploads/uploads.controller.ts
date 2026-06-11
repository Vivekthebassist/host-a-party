import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService, UploadFolder } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':folder')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: UploadFolder,
  ) {
    const validFolders: UploadFolder[] = ['avatars', 'events', 'id-proofs', 'chat'];
    if (!validFolders.includes(folder)) {
      folder = 'avatars';
    }
    return this.uploadsService.uploadImage(file, folder);
  }
}
