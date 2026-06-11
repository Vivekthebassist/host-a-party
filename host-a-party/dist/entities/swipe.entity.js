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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swipe = exports.SwipeDirection = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const event_entity_1 = require("./event.entity");
var SwipeDirection;
(function (SwipeDirection) {
    SwipeDirection["LEFT"] = "left";
    SwipeDirection["RIGHT"] = "right";
    SwipeDirection["SUPER_LIKE"] = "super_like";
})(SwipeDirection || (exports.SwipeDirection = SwipeDirection = {}));
let Swipe = class Swipe {
};
exports.Swipe = Swipe;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Swipe.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.swipesMade, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'swiperId' }),
    __metadata("design:type", user_entity_1.User)
], Swipe.prototype, "swiper", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Swipe.prototype, "swiperId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.swipesReceived, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'swipedId' }),
    __metadata("design:type", user_entity_1.User)
], Swipe.prototype, "swiped", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Swipe.prototype, "swipedId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.swipes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", event_entity_1.Event)
], Swipe.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Swipe.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SwipeDirection }),
    __metadata("design:type", String)
], Swipe.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Swipe.prototype, "createdAt", void 0);
exports.Swipe = Swipe = __decorate([
    (0, typeorm_1.Entity)('swipes'),
    (0, typeorm_1.Unique)(['swiperId', 'swipedId', 'eventId'])
], Swipe);
//# sourceMappingURL=swipe.entity.js.map