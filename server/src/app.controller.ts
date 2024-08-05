import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Video } from './video.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAllVideos(): Promise<Video[]> {
    return this.appService.getAllVideos();
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
