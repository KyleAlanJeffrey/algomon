import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { fetchAllVideos, fetchVideosByDateString } from "~/api";
import WordCloud from "~/components/word-cloud";
import { getTodayDateString } from "~/helpers";
import { Video } from "~/types";

export default function Home() {
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
    <>
      <Head>
        <title>Algomon</title>
        <meta
          name="description"
          content="Algomon. The Youtube Algorithm Analyzer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-themefireenginered">
        <h1 className="font-extrabold tracking-tight text-white sm:text-[3rem]">
          Youtube Algorithm
        </h1>
        <section
          title="Todays Suggestions"
          className="flex max-h-72 w-full flex-col items-center justify-start overflow-y-auto bg-themelapislazuli px-4"
        >
          <h2 className="font-semibold text-themebabypowdder sm:text-2xl">
            Todays Recommended
          </h2>
          <ul className="gap-2">
            {videos.data?.map((video) => (
              <li key={video.url}>
                <Link href={video.url}>
                  <div className="flex items-center gap-2">
                    <img
                      src={video.imageUrl}
                      alt={video.title}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <h2 className="text-l text-white">{video.title}</h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section
          title="Todays Word Cloud"
          className="flex w-full flex-col items-center justify-start bg-themeschoolbusyellow"
        >
          <h2 className="text-themelapislazul font-semibold sm:text-2xl">
            Todays Word Cloud
          </h2>
          <WordCloud videos={videos.data} />
        </section>
      </main>
    </>
  );
}

// px-4 py-16
