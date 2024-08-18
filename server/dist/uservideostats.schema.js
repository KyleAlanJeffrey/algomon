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
exports.UserVideoStatsSchema = exports.UserVideoStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const video_schema_1 = require("./video.schema");
const user_schema_1 = require("./user.schema");
let UserVideoStats = class UserVideoStats {
};
exports.UserVideoStats = UserVideoStats;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", user_schema_1.User)
], UserVideoStats.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserVideoStats.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", video_schema_1.Video)
], UserVideoStats.prototype, "videoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], UserVideoStats.prototype, "timesWatched", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], UserVideoStats.prototype, "timesSeen", void 0);
exports.UserVideoStats = UserVideoStats = __decorate([
    (0, mongoose_1.Schema)()
], UserVideoStats);
exports.UserVideoStatsSchema = mongoose_1.SchemaFactory.createForClass(UserVideoStats);
//# sourceMappingURL=uservideostats.schema.js.map