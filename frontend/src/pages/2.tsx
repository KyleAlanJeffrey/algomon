import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { fetchAllVideos } from "~/api";
import { Video } from "~/types";
import Image from "next/image";
import backdropSvg from "../../public/wrapped-softpink.svg";
import UrlButton from "~/components/url-button";
import WordCloud from "~/components/word-cloud";

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
      <main className="bg-themeprettypink flex min-h-screen items-center justify-center border-2 border-black text-[#22306D]">
        <div className="flex flex-col items-center justify-center gap-5 p-8">
          <Headline>
            The word <span className="text-themelapislazuli">'Truck Nuts'</span>{" "}
            showed up 500 times in your feed
          </Headline>
          <WordCloud videos={videos.data} />
        </div>
      </main>
    </>
  );
}

const Headline = (props: React.PropsWithChildren) => {
  return (
    <h1 className="text-7xl font-extrabold tracking-tight">{props.children}</h1>
  );
};
