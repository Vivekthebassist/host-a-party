"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const join_request_entity_1 = require("../entities/join-request.entity");
const event_entity_1 = require("../entities/event.entity");
const join_requests_service_1 = require("./join-requests.service");
const join_requests_controller_1 = require("./join-requests.controller");
const notifications_module_1 = require("../notifications/notifications.module");
let JoinRequestsModule = class JoinRequestsModule {
};
exports.JoinRequestsModule = JoinRequestsModule;
exports.JoinRequestsModule = JoinRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([join_request_entity_1.JoinRequest, event_entity_1.Event]), notifications_module_1.NotificationsModule],
        controllers: [join_requests_controller_1.JoinRequestsController],
        providers: [join_requests_service_1.JoinRequestsService],
        exports: [join_requests_service_1.JoinRequestsService],
    })
], JoinRequestsModule);
//# sourceMappingURL=join-requests.module.js.map