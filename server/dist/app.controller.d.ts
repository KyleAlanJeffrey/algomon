import { AppService } from './app.service';
import { Video } from './video.schema';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getVideos(date: string): Promise<Video[]>;
    postVideos(videos: Video[]): Promise<string>;
}
