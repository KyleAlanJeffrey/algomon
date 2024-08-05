import { AppService } from './app.service';
import { Video } from './video.schema';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getAllVideos(): Promise<Video[]>;
    postVideos(videos: Video[]): Promise<string>;
}
