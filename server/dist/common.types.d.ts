import { User } from './user.schema';
export interface DateView {
    [date: string]: number;
}
export type ScrapedVideo = {
    url: string;
    title: string;
    imageUrl: string;
    date: string;
};
export type ScrapedVideosWithUser = {
    user: User;
    videos: ScrapedVideo[];
};
