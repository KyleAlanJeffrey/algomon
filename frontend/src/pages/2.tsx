import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { fetchAllVideos, fetchWordAggregations } from "~/api";
import { Video, Word } from "~/types";
import UrlButton from "~/components/url-button";
import WordCloud, { WordData } from "~/components/word-cloud";
import { useEffect, useState } from "react";
import { blacklistWords } from "~/helpers";

// function wordFreq(text: string): [WordData[], number, string] {
//   const words: string[] = text.replace(/\./g, "").split(/\s/);
//   const freqMap: Record<string, number> = {};

//   for (const w of words) {
//     if (!freqMap[w]) freqMap[w] = 0;
//     freqMap[w] += 1;
//   }
//   const wordData = Object.keys(freqMap).map((word) => ({
//     text: word,
//     value: freqMap[word],
//   }));
//   const filteredWordData = wordData.filter(
//     (wData) =>
//       wData.value > 2 && !blacklistWords.includes(wData.text.toLowerCase()),
//   );
//   let mostFreqWord: string = "";
//   let maxFreq = 0;
//   for (let i = 0; i < filteredWordData.length; i += 1) {
//     const wData = filteredWordData[i];
//     if (wData.value > maxFreq) {
//       maxFreq = wData.value;
//       mostFreqWord = wData?.text;
//     }
//   }
//   return [filteredWordData, maxFreq, mostFreqWord];
// }

export default function Home() {
  const [maxFreq, setMaxFreq] = useState(1);
  const [minFreq, setMinFreq] = useState(1);
  const [maxFrequencyWord, setmaxFrequencyWord] = useState<string>();
  const [totalVideos, setTotalVideos] = useState<number>(0);

  const words = useQuery({
    queryKey: ["words"],
    queryFn: async () => {
      const response = await fetchWordAggregations(200);
      setTotalVideos(response.data.videoMetrics.totalVideos);
      return response.data.wordData;
    },
  });

  useEffect(() => {
    if (words.isSuccess && words.data) {
      if (!words.data[0]) return;
      setMaxFreq(words.data[0].timesSeen);
      setmaxFrequencyWord(words.data[0].text);
      const maxIndex = words.data.length - 1;
      setMinFreq(words.data[maxIndex] ? words.data[maxIndex].timesSeen : 1);
    }
  }, [words.isSuccess, words.data]);

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
            {totalVideos}
          </span>
          videos the word
          <span className="mx-[1rem] text-themelapislazuli">
            '{maxFrequencyWord}'
          </span>
          showed up {maxFreq} times in your feed
        </Headline>
        <WordCloud
          wordData={words?.data || []}
          maxFrequency={maxFreq}
          minFrequency={minFreq}
        />
        <div className="flex flex-1 justify-end">
          <UrlButton color="text-themelapislazuli" text="next" url={"/3"} />
        </div>
      </main>
    </>
  );
}

const Headline = (props: React.PropsWithChildren) => {
  return <h1 className="font-extrabold tracking-tight">{props.children}</h1>;
};
