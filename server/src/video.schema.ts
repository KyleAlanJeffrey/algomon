import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema()
export class Video {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  imageUrl: string;

  @Prop()
  date: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
