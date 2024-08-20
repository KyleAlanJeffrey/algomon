import { Injectable } from '@nestjs/common';
import { Video } from './video.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation, Model } from 'mongoose';
import { ScrapedVideo } from './common.types';
import { UserVideoStats } from './uservideostats.schema';
import { User } from './user.schema';
import { Word } from './word.schema';
import { blacklistWords } from './helpers';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @InjectModel(UserVideoStats.name)
    private userVideoStats: Model<UserVideoStats>,
    @InjectModel(User.name) private User: Model<User>,
    @InjectModel(Word.name) private words: Model<Word>,
  ) {}

  async getAllVideos(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async getVideoByDate(date: string): Promise<Video[]> {
    return this.videoModel.find({ date: date }).exec();
  }

  async getWordAggregations(n: number): Promise<Word[]> {
    return this.words.find().sort({ timesSeen: -1 }).limit(n).exec();
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
          filter: {
            videoUrl: video.url,
            date: video.date,
            username: user.username,
          },
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

    const words = videos
      .map((video) =>
        video.title
          .split(' ')
          .map((word) => [video.url, word.toLowerCase(), video.date]),
      )
      .flat()
      .filter(([_, word]) => !blacklistWords.includes(word));

    console.log(`Scraped ${words.length} words from ${videos.length} videos`);
    const wordsOperations: AnyBulkWriteOperation<Word>[] = words.map(
      ([url, word, date]) => ({
        updateOne: {
          filter: { text: word, date: date, username: user.username },
          update: {
            $setOnInsert: {
              text: word,
              username: user.username,
              date: date,
            },
            $inc: { timesSeen: 1, timesWatched: 0 },
            $addToSet: { videoUrls: url },
          },
          upsert: true,
        },
      }),
    );
    return Promise.all([
      this.videoModel.bulkWrite(videoOperations),
      this.userVideoStats.bulkWrite(userVideoOperations),
      this.words.bulkWrite(wordsOperations),
    ]);
  }
}
