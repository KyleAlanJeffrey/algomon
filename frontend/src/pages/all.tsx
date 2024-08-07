import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { fetchAllVideos } from "~/api";
import { Video } from "~/types";

export default function Home() {
  const videos = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const response = await fetchAllVideos();
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            All Videos
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <ul>
              {videos.data?.map((video) => (
                <li key={video.url}>
                  <Link href={video.url}>
                    <div className="flex items-center gap-4">
                      <img
                        src={video.imageUrl}
                        alt={video.title}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <h2 className="text-xl font-semibold text-white">
                        {video.title}
                      </h2>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}