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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const video_schema_1 = require("./video.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uservideostats_schema_1 = require("./uservideostats.schema");
const user_schema_1 = require("./user.schema");
let AppService = class AppService {
    constructor(videoModel, userVideoStats, User) {
        this.videoModel = videoModel;
        this.userVideoStats = userVideoStats;
        this.User = User;
    }
    async getAllVideos() {
        return this.videoModel.find().exec();
    }
    async getVideoByDate(date) {
        return this.videoModel.find({ date: date }).exec();
    }
    async createUser(user) {
        return this.User.updateOne({ username: user.username }, {}, { upsert: true });
    }
    async postVideos(videos, user) {
        const videoOperations = videos.map((video) => ({
            updateOne: {
                filter: { url: video.url },
                update: {
                    user: { $setOnInsert: user },
                    url: { $setOnInsert: video.url },
                    title: { $setOnInsert: video.title },
                    imageUrl: { $setOnInsert: video.imageUrl },
                    timesSeen: { $inc: 1 },
                },
                upsert: true,
            },
        }));
        const userVideoOperations = videos.map((video) => ({
            updateOne: {
                filter: { videoUrl: video.url, date: video.date },
                update: {
                    videoUrl: { $setOnInsert: video.url },
                    user: { $setOnInsert: user },
                    date: { $setOnInsert: video.date },
                    timesSeen: { $inc: 1, $setOnInsert: 1 },
                    timesWatched: { $inc: 1, $setOnInsert: 1 },
                },
                upsert: true,
            },
        }));
        return Promise.all([
            this.videoModel.bulkWrite(videoOperations),
            this.userVideoStats.bulkWrite(userVideoOperations),
        ]);
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(video_schema_1.Video.name)),
    __param(1, (0, mongoose_1.InjectModel)(uservideostats_schema_1.UserVideoStats.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AppService);
//# sourceMappingURL=app.service.js.map