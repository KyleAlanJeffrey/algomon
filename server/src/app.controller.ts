import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Video } from './video.schema';
import { ScrapedVideosWithUser } from './common.types';
import { Word } from './word.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getVideos(@Query('date') date: string): Promise<Video[]> {
    if (!date) {
      console.log('Finding all videos');
      return this.appService.getAllVideos();
    } else {
      console.log(`Finding videos for date: ${date}`);
      return this.appService.getVideoByDate(date);
    }
  }

  @Get('words')
  async getWords(@Query('n') n: number): Promise<Word[]> {
    if (!n) {
      n = 100;
    }
    return this.appService.getWordAggregations(n);
  }

  @Post()
  @HttpCode(201)
  async postVideos(@Body() body: ScrapedVideosWithUser) {
    console.log('Posting videos');
    try {
      const { user, videos } = body;
      await this.appService.createUser(user);
      await this.appService.postVideos(videos, user);
      return 'Videos added successfully';
    } catch (e) {
      throw new HttpException(e, HttpStatus.AMBIGUOUS);
    }
  }
}
