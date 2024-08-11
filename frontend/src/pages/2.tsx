import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { fetchAllVideos, fetchVideosByDateString } from "~/api";
import { Video } from "~/types";
import Image from "next/image";
import backdropSvg from "../../public/wrapped-softpink.svg";
import UrlButton from "~/components/url-button";
import WordCloud, { WordData } from "~/components/word-cloud";
import { useEffect, useState } from "react";
import { blacklistWords } from "~/helpers";
import Header from "./_header";

function wordFreq(text: string): [WordData[], number, string] {
  const words: string[] = text.replace(/\./g, "").split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  const wordData = Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
  const filteredWordData = wordData.filter(
    (wData) =>
      wData.value > 2 && !blacklistWords.includes(wData.text.toLowerCase()),
  );
  let mostFreqWord: string = "";
  let maxFreq = 0;
  for (let i = 0; i < filteredWordData.length; i += 1) {
    const wData = filteredWordData[i];
    if (wData.value > maxFreq) {
      maxFreq = wData.value;
      mostFreqWord = wData?.text;
    }
  }
  return [filteredWordData, maxFreq, mostFreqWord];
}

export default function Home() {
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [maxFreq, setMaxFreq] = useState(1);
  const [maxFrequencyWord, setmaxFrequencyWord] = useState<WordData>();
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

  useEffect(() => {
    if (videos.isSuccess && videos.data) {
      const allTitles = videos.data.map((v) => v.title);
      const allText = allTitles.join(" ");
      const [allWords, maxFreq, mostFreqWord] = wordFreq(allText);
      setMaxFreq(maxFreq);
      setmaxFrequencyWord({ text: mostFreqWord, value: maxFreq });
      const filteredWords = allWords.filter(
        (word) => !blacklistWords.includes(word.text.toLowerCase()),
      );
      console.log(filteredWords);
      setWordData(filteredWords);
    }
  }, [videos.data, videos.isSuccess]);

  return (
    <>
      <Head>
        <title>Algomon</title>
        <meta
          name="description"
          content="Algomon. The Youtube Algorithm Analyzer"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="items-stetch flex h-full min-h-screen w-full flex-col justify-center gap-4 bg-themeprettypink p-5 text-3xl text-[#22306D] md:text-5xl lg:text-7xl">
        <Headline>
          Out of
          <span className="mx-[1rem] text-themefireenginered">
            {videos?.data?.length}
          </span>
          videos the word
          <span className="mx-[1rem] text-themelapislazuli">
            '{maxFrequencyWord?.text}'
          </span>
          showed up {maxFrequencyWord?.value} times in your feed
        </Headline>
        <WordCloud wordData={wordData} maxFrequency={maxFreq} />
        <div className="absolute bottom-3 right-3">
          <UrlButton color="text-themelapislazuli" text="next" url={"/3"} />
        </div>
      </main>
    </>
  );
}

const Headline = (props: React.PropsWithChildren) => {
  return <h1 className="font-extrabold tracking-tight">{props.children}</h1>;
};
