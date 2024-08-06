import { useQuery } from "@tanstack/react-query";
import { fetchVideosByDateString } from "~/api";
import WordCloud from "~/components/word-cloud";
import { Video } from "~/types";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  // zero padding
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  // zero padding
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export default function DailyCloud() {
  const videos = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const response = await fetchVideosByDateString(getTodayDateString());
      if (response.status !== 200) {
        throw new Error("Failed to fetch videos");
      }
      if (!response.data) {
        throw new Error("No videos found");
      }
      return response.data as Video[];
    },
  });

  return (
    <section
      title="Todays Word Cloud"
      className="flex flex-1 flex-col items-center justify-center"
    >
      <h1>{getTodayDateString()} Word Cloud </h1>
      {videos.isSuccess && <WordCloud videos={videos.data} />}
    </section>
  );
}
