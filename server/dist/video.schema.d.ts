import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
export type VideoDocument = HydratedDocument<Video>;
export declare class Video {
    url: string;
    title: string;
    imageUrl: string;
    user: User;
    timesWatched: number;
    datesWatched: Map<string, number>;
    timesSeen: number;
    datesSeen: Map<string, number>;
}
export declare const VideoSchema: import("mongoose").Schema<Video, import("mongoose").Model<Video, any, any, any, import("mongoose").Document<unknown, any, Video> & Video & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Video, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Video>> & import("mongoose").FlatRecord<Video> & {
    _id: import("mongoose").Types.ObjectId;
}>;
