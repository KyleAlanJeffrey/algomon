export type WordData = {
  text: string;
  date: Date;
  videoUrls: string[];
  timesWatched: number;
  timesSeen: number;
};
export type WordAggregationResponse = {
  videoMetrics: {
    totalVideos: number;
  };
  wordData: WordData[];
};
export type VideoStats = {
  totalVideos: number;
}