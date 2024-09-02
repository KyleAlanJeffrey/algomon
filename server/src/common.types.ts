import { User } from './user.schema';

// date -> yyyy-mm-dd 2024-08-11
export interface DateView {
  [date: string]: number;
}
// These only apply for the specified date
export type ScrapedVideo = {
  url: string;
  title: string;
  imageUrl: string;
  date: Date; // Date object from beginning of day
  dateTime: Date; // Day with time of scraping
};

export type ScrapedVideosWithUser = {
  user: User;
  videos: ScrapedVideo[];
};
