import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { fetchAllVideos } from "~/api";
import { Video } from "~/types";
import Image from "next/image";
import backdropSvg from "../../public/wrapped-softpink.svg";
import UrlButton from "~/components/url-button";

export default function Home() {
  const thisMonth = new Date().toLocaleString("default", { month: "long" });
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
      <main className="flex min-h-screen items-center justify-center border-2 border-black bg-themesoftpink text-black">
        <section className="z-10 flex flex-row items-end gap-10">
          <div className="flex flex-col items-start justify-center">
            <Headline>
              Your <span className="text-themelapislazuli">{thisMonth}</span>{" "}
            </Headline>
            <Headline>Youtube</Headline>
            <Headline>Wrapped</Headline>
          </div>
          <div className="p-3">
            <UrlButton
              color="text-themelapislazuli"
              url={"/2"}
              text="Click Me"
            />
          </div>
        </section>
      </main>
    </>
  );
}

const Headline = (props: React.PropsWithChildren) => {
  return (
    <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
      {props.children}
    </h1>
  );
};
