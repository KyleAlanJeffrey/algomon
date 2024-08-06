import { Injectable } from '@nestjs/common';
import { Video } from './video.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async getAllVideos(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async getVideoByDate(date: string): Promise<Video[]> {
    return this.videoModel.find({ date: date }).exec();
  }

  async postVideos(videos: Video[]) {
    return this.videoModel.insertMany(videos);
  }
}
