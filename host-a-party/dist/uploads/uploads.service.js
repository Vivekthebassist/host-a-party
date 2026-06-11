"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const storage_interface_1 = require("./storage.interface");
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
let UploadsService = class UploadsService {
    constructor(storage) {
        this.storage = storage;
    }
    async uploadImage(file, folder) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File size must be under 5MB');
        }
        const url = await this.storage.upload(file, folder);
        return { url };
    }
    async deleteFile(fileUrl) {
        await this.storage.delete(fileUrl);
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(storage_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map