import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Video } from './video.schema';
import { User } from './user.schema';

export type UserVideoStatsDocument = HydratedDocument<UserVideoStats>;

@Schema()
export class UserVideoStats {
  @Prop({ required: true })
  user: User;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  videoUrl: Video;

  @Prop({ required: true })
  timesWatched: number;

  @Prop({ required: true })
  timesSeen: number;
}

export const UserVideoStatsSchema =
  SchemaFactory.createForClass(UserVideoStats);
