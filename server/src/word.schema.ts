import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Video } from './video.schema';
import { User } from './user.schema';
import { DateView } from './common.types';

export type WordDocument = HydratedDocument<Word>;

@Schema()
export class Word {
  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  user: User;

  @Prop({ required: true })
  videos: Video[];

  @Prop({ required: true })
  timesWatched: number;

  @Prop({ required: true })
  datesWatched: DateView;

  @Prop({ required: true })
  timesSeen: number;

  @Prop({ required: true })
  datesSeen: DateView;
}

export const WordSchema = SchemaFactory.createForClass(Word);
