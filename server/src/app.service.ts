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
    @InjectModel(User.name) private User: Model<User>,
  ) {}

  async getAllVideos(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async getVideoByDate(date: string): Promise<Video[]> {
    return this.videoModel.find({ date: date }).exec();
  }

  async createUser(user: User) {
    if (await this.User.exists({ username: user.username })) {
      return;
    }
    this.User.create(user);
  }
  async postVideos(videos: ScrapedVideo[], user: User) {
    // Update all the metrics for the date specified of the video
    const videoOperations: AnyBulkWriteOperation<Video>[] = videos.map(
      (video) => ({
        updateOne: {
          filter: { url: video.url, username: user.username },
          update: {
            $setOnInsert: {
              username: user.username,
              url: video.url,
              title: video.title,
              imageUrl: video.imageUrl,
            },
            $inc: { timesSeen: 1, timesWatched: 0 },
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
            $setOnInsert: {
              videoUrl: video.url,
              date: video.date,
              username: user.username,
            },
            $inc: {
              timesSeen: 1,
              timesWatched: 0,
            },
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
