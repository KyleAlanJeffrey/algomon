import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './video.schema';
import { ConfigModule } from '@nestjs/config';
import { UserVideoStats, UserVideoStatsSchema } from './uservideostats.schema';
import { User, UserSchema } from './user.schema';
import { Word, WordSchema } from './word.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV.replace(' ', '') == 'dev'
          ? '.env.development'
          : '.env',
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([
      { name: UserVideoStats.name, schema: UserVideoStatsSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
