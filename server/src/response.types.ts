export type WordData = {
  text: string;
  date: string;
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
