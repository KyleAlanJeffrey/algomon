import { Injectable } from '@nestjs/common';
import { Video } from './video.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation, Model } from 'mongoose';
import { ScrapedVideo } from './common.types';
import { UserVideoStats } from './uservideostats.schema';
import { User } from './user.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @InjectModel(UserVideoStats.name)
    private userVideoStats: Model<UserVideoStats>,
  ) {}

  async getAllVideos(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async getVideoByDate(date: string): Promise<Video[]> {
    return this.videoModel.find({ date: date }).exec();
  }

  async postVideos(videos: ScrapedVideo[], user: User) {
    // Update all the metrics for the date specified of the video
    const videoOperations: AnyBulkWriteOperation<Video>[] = videos.map(
      (video) => ({
        updateOne: {
          filter: { url: video.url },
          update: {
            user: { $setOnInsert: user },
            url: { $setOnInsert: video.url },
            title: { $setOnInsert: video.title },
            imageUrl: { $setOnInsert: video.imageUrl },
            timesSeen: { $inc: 1 },
          },
          upsert: true,
        },
      }),
    );
    const userVideoOperations: AnyBulkWriteOperation<UserVideoStats>[] =
      videos.map((video) => ({
        updateOne: {
          filter: { videoUrl: video.url, date: video.date },
          update: {
            videoUrl: { $setOnInsert: video.url },
            user: { $setOnInsert: user },
            date: { $setOnInsert: video.date },
            timesSeen: { $inc: 1, $setOnInsert: 1 },
            timesWatched: { $inc: 1, $setOnInsert: 1 },
          },
          upsert: true,
        },
      }));
    return Promise.all([
      this.videoModel.bulkWrite(videoOperations),
      this.userVideoStats.bulkWrite(userVideoOperations),
    ]);
  }
}
