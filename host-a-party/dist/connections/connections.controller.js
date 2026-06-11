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
exports.ConnectionsController = void 0;
const common_1 = require("@nestjs/common");
const connections_service_1 = require("./connections.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const dto_1 = require("./dto");
let ConnectionsController = class ConnectionsController {
    constructor(connectionsService) {
        this.connectionsService = connectionsService;
    }
    swipe(eventId, user, dto) {
        return this.connectionsService.swipe(user.id, eventId, dto.targetUserId, dto.direction);
    }
    getCandidates(eventId, user) {
        return this.connectionsService.getSwipeCandidates(user.id, eventId);
    }
    getEventMatches(eventId, user) {
        return this.connectionsService.getEventMatches(user.id, eventId);
    }
    getAllMatches(user) {
        return this.connectionsService.getAllMatches(user.id);
    }
};
exports.ConnectionsController = ConnectionsController;
__decorate([
    (0, common_1.Post)('events/:eventId/swipe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User,
        dto_1.SwipeDto]),
    __metadata("design:returntype", void 0)
], ConnectionsController.prototype, "swipe", null);
__decorate([
    (0, common_1.Get)('events/:eventId/candidates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ConnectionsController.prototype, "getCandidates", null);
__decorate([
    (0, common_1.Get)('events/:eventId/matches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ConnectionsController.prototype, "getEventMatches", null);
__decorate([
    (0, common_1.Get)('matches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ConnectionsController.prototype, "getAllMatches", null);
exports.ConnectionsController = ConnectionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [connections_service_1.ConnectionsService])
], ConnectionsController);
//# sourceMappingURL=connections.controller.js.map