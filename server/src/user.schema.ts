import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VideoDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
   username: string;

  @Prop({ required: true })
  name: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
