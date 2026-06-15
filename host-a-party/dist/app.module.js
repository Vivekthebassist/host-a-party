"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const schedule_1 = require("@nestjs/schedule");
const path = __importStar(require("path"));
const user_entity_1 = require("./entities/user.entity");
const event_entity_1 = require("./entities/event.entity");
const join_request_entity_1 = require("./entities/join-request.entity");
const swipe_entity_1 = require("./entities/swipe.entity");
const match_entity_1 = require("./entities/match.entity");
const message_entity_1 = require("./entities/message.entity");
const notification_entity_1 = require("./entities/notification.entity");
const check_in_entity_1 = require("./entities/check-in.entity");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const events_module_1 = require("./events/events.module");
const join_requests_module_1 = require("./join-requests/join-requests.module");
const connections_module_1 = require("./connections/connections.module");
const messages_module_1 = require("./messages/messages.module");
const notifications_module_1 = require("./notifications/notifications.module");
const check_ins_module_1 = require("./check-ins/check-ins.module");
const uploads_module_1 = require("./uploads/uploads.module");
const gateway_module_1 = require("./gateway/gateway.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.resolve(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
                serveStaticOptions: { index: false },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST'),
                    port: config.get('DB_PORT'),
                    username: config.get('DB_USERNAME'),
                    password: config.get('DB_PASSWORD'),
                    database: config.get('DB_NAME'),
                    ssl: true,
                    entities: [user_entity_1.User, event_entity_1.Event, join_request_entity_1.JoinRequest, swipe_entity_1.Swipe, match_entity_1.Match, message_entity_1.Message, notification_entity_1.Notification, check_in_entity_1.CheckIn],
                    synchronize: true,
                    logging: ['error', 'warn'],
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            events_module_1.EventsModule,
            join_requests_module_1.JoinRequestsModule,
            connections_module_1.ConnectionsModule,
            messages_module_1.MessagesModule,
            notifications_module_1.NotificationsModule,
            check_ins_module_1.CheckInsModule,
            uploads_module_1.UploadsModule,
            gateway_module_1.GatewayModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map