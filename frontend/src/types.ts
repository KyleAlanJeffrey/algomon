export type Video = {
  url: string;
  title: string;
  imageUrl: string;
  date: string;
};

export type Word = {
  text: string;
  date: string;
  username: string;
  videoUrls: string[];
  timesWatched: number;
  timesSeen: number;
};
