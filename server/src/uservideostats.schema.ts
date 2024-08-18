import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserVideoStatsDocument = HydratedDocument<UserVideoStats>;

@Schema()
export class UserVideoStats {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ required: true })
  timesWatched: number;

  @Prop({ required: true })
  timesSeen: number;
}

export const UserVideoStatsSchema =
  SchemaFactory.createForClass(UserVideoStats);
