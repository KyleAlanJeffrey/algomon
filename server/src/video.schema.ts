import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { DateView } from './common.types';
import { User } from './user.schema';

export type VideoDocument = HydratedDocument<Video>;

@Schema()
export class Video {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  user: User;

  @Prop({ required: true })
  timesWatched: number;

  @Prop({ required: true })
  datesWatched: Map<string, number>;

  @Prop({ required: true })
  timesSeen: number;

  @Prop({ required: true })
  datesSeen: Map<string, number>;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
