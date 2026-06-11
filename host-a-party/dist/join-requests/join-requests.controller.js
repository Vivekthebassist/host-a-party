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
exports.JoinRequestsController = void 0;
const common_1 = require("@nestjs/common");
const join_requests_service_1 = require("./join-requests.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const dto_1 = require("./dto");
let JoinRequestsController = class JoinRequestsController {
    constructor(joinReqService) {
        this.joinReqService = joinReqService;
    }
    create(eventId, user, dto) {
        return this.joinReqService.create(user.id, eventId, dto);
    }
    getEventRequests(eventId, user) {
        return this.joinReqService.getEventRequests(eventId, user.id);
    }
    respond(id, user, dto) {
        return this.joinReqService.respond(id, user.id, dto.status);
    }
    getMyRequests(user) {
        return this.joinReqService.getMyRequests(user.id);
    }
    cancel(id, user) {
        return this.joinReqService.cancel(id, user.id);
    }
};
exports.JoinRequestsController = JoinRequestsController;
__decorate([
    (0, common_1.Post)('events/:eventId/join-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User,
        dto_1.CreateJoinRequestDto]),
    __metadata("design:returntype", void 0)
], JoinRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('events/:eventId/join-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], JoinRequestsController.prototype, "getEventRequests", null);
__decorate([
    (0, common_1.Patch)('join-requests/:id/respond'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User,
        dto_1.RespondJoinRequestDto]),
    __metadata("design:returntype", void 0)
], JoinRequestsController.prototype, "respond", null);
__decorate([
    (0, common_1.Get)('join-requests/mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], JoinRequestsController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Delete)('join-requests/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], JoinRequestsController.prototype, "cancel", null);
exports.JoinRequestsController = JoinRequestsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [join_requests_service_1.JoinRequestsService])
], JoinRequestsController);
//# sourceMappingURL=join-requests.controller.js.map