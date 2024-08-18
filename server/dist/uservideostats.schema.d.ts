import { HydratedDocument } from 'mongoose';
import { Video } from './video.schema';
import { User } from './user.schema';
export type UserVideoStatsDocument = HydratedDocument<UserVideoStats>;
export declare class UserVideoStats {
    user: User;
    date: string;
    videoUrl: Video;
    timesWatched: number;
    timesSeen: number;
}
export declare const UserVideoStatsSchema: import("mongoose").Schema<UserVideoStats, import("mongoose").Model<UserVideoStats, any, any, any, import("mongoose").Document<unknown, any, UserVideoStats> & UserVideoStats & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserVideoStats, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<UserVideoStats>> & import("mongoose").FlatRecord<UserVideoStats> & {
    _id: import("mongoose").Types.ObjectId;
}>;
