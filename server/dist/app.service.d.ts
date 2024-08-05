import { Video } from './video.schema';
import { Model } from 'mongoose';
export declare class AppService {
    private videoModel;
    constructor(videoModel: Model<Video>);
    getAllVideos(): Promise<Video[]>;
    postVideos(videos: Video[]): Promise<(import("mongoose").Document<unknown, {}, Video> & Video & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
}
