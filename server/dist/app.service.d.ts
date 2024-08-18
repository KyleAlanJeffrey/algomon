import { Video } from './video.schema';
import { Model } from 'mongoose';
import { ScrapedVideo } from './common.types';
import { UserVideoStats } from './uservideostats.schema';
import { User } from './user.schema';
export declare class AppService {
    private videoModel;
    private userVideoStats;
    private User;
    constructor(videoModel: Model<Video>, userVideoStats: Model<UserVideoStats>, User: Model<User>);
    getAllVideos(): Promise<Video[]>;
    getVideoByDate(date: string): Promise<Video[]>;
    createUser(user: User): Promise<import("mongoose").UpdateWriteOpResult>;
    postVideos(videos: ScrapedVideo[], user: User): Promise<[import("mongodb").BulkWriteResult, import("mongodb").BulkWriteResult]>;
}
