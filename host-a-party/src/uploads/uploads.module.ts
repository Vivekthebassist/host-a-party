import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { LocalStorageProvider } from './local-storage.provider';
import { STORAGE_PROVIDER } from './storage.interface';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    {
      // Swap this to S3StorageProvider for production
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
