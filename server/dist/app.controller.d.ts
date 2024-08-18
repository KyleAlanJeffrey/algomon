import { AppService } from './app.service';
import { Video } from './video.schema';
import { ScrapedVideosWithUser } from './common.types';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getVideos(date: string): Promise<Video[]>;
    postVideos(body: ScrapedVideosWithUser): Promise<string>;
}
