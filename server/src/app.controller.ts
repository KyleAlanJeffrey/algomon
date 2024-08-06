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

  @Post()
  @HttpCode(201)
  async postVideos(@Body() videos: Video[]) {
    try {
      await this.appService.postVideos(videos);
      return 'Videos added successfully';
    } catch (e) {
      throw new HttpException(e, HttpStatus.AMBIGUOUS);
    }
  }
}
