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
exports.CheckInsController = void 0;
const common_1 = require("@nestjs/common");
const check_ins_service_1 = require("./check-ins.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const dto_1 = require("./dto");
let CheckInsController = class CheckInsController {
    constructor(checkInsService) {
        this.checkInsService = checkInsService;
    }
    checkIn(eventId, user, dto) {
        return this.checkInsService.checkIn(user.id, eventId, dto.latitude, dto.longitude);
    }
    getEventCheckIns(eventId) {
        return this.checkInsService.getEventCheckIns(eventId);
    }
    getStatus(eventId, user) {
        return this.checkInsService.getCheckInStatus(user.id, eventId);
    }
};
exports.CheckInsController = CheckInsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User,
        dto_1.CheckInDto]),
    __metadata("design:returntype", void 0)
], CheckInsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CheckInsController.prototype, "getEventCheckIns", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CheckInsController.prototype, "getStatus", null);
exports.CheckInsController = CheckInsController = __decorate([
    (0, common_1.Controller)('events/:eventId/check-ins'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [check_ins_service_1.CheckInsService])
], CheckInsController);
//# sourceMappingURL=check-ins.controller.js.map