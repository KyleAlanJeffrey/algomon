import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './video.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://trucker:truck-nuts@localhost:27017'),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
