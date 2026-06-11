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
exports.RespondJoinRequestDto = void 0;
const class_validator_1 = require("class-validator");
const join_request_entity_1 = require("../../entities/join-request.entity");
class RespondJoinRequestDto {
}
exports.RespondJoinRequestDto = RespondJoinRequestDto;
__decorate([
    (0, class_validator_1.IsEnum)([join_request_entity_1.JoinRequestStatus.APPROVED, join_request_entity_1.JoinRequestStatus.REJECTED], {
        message: 'Status must be approved or rejected',
    }),
    __metadata("design:type", String)
], RespondJoinRequestDto.prototype, "status", void 0);
//# sourceMappingURL=respond-join-request.dto.js.map