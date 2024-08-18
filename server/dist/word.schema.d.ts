import { HydratedDocument } from 'mongoose';
import { Video } from './video.schema';
import { User } from './user.schema';
import { DateView } from './common.types';
export type WordDocument = HydratedDocument<Word>;
export declare class Word {
    value: string;
    user: User;
    videos: Video[];
    timesWatched: number;
    datesWatched: DateView;
    timesSeen: number;
    datesSeen: DateView;
}
export declare const WordSchema: import("mongoose").Schema<Word, import("mongoose").Model<Word, any, any, any, import("mongoose").Document<unknown, any, Word> & Word & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Word, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Word>> & import("mongoose").FlatRecord<Word> & {
    _id: import("mongoose").Types.ObjectId;
}>;
