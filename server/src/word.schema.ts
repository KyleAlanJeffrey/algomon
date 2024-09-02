import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WordDocument = HydratedDocument<Word>;

// This is unique to a day
@Schema()
export class Word {
  @Prop({ required: true })
  text: string;

  @Prop({type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  videoUrls: string[];

  @Prop({ required: true })
  timesWatched: number;

  @Prop({ required: true })
  timesSeen: number;
}

export const WordSchema = SchemaFactory.createForClass(Word);
