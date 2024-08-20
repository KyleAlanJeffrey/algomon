import React, { useEffect, useRef, useState } from "react";
import { Text } from "@visx/text";
import { scaleLinear, scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import { blacklistWords } from "~/helpers";
import { Video, Word, WordData } from "~/types";

export type Dimensions = {
  width: number;
  height: number;
};

const colors = ["#c1292eff", " #f1d302ff", "#cff469"];

function getRotationDegree() {
  const rand = Math.random();
  const degree = rand > 0.5 ? 60 : -60;
  return rand * degree;
}

type SpiralType = "archimedean" | "rectangular";

export default function WordCloud(props: {
  wordData: WordData[];
  maxFrequency: number;
  minFrequency: number;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [spiralType, setSpiralType] = useState<SpiralType>("archimedean");
  const [withRotation, setWithRotation] = useState(false);
  const [divDimensions, setDivDimensions] = useState<Dimensions>();

  const [showPopup, setShowPopup] = useState(true);
  useEffect(() => {
    if (divRef.current) {
      setDivDimensions({
        width: divRef.current?.clientWidth,
        height: divRef.current?.clientHeight,
      });
    }
    window.addEventListener("resize", () => {
      if (!divRef.current) return;
      console.log(divRef.current.clientWidth);
      setDivDimensions({
        width: divRef.current?.clientWidth,
        height: divRef.current?.clientHeight,
      });
    });
  }, []);
  return (
    <div className="max-h-[80%] flex-[8]" ref={divRef}>
      <Wordcloud<WordData>
        words={props.wordData}
        height={divDimensions?.height || 100}
        width={divDimensions?.width || 100}
        fontSize={(datum) =>
          scaleLog({
            domain: [props.minFrequency, props.maxFrequency],
            range: [20, 50],
          })(datum.timesSeen)
        }
        font={"Impact"}
        padding={2}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}

        // random={fixedValueGenerator}
      >
        {(cloudWords) => {
          console.log(cloudWords);
          return cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
              onMouseOver={(ev) => {
                setShowPopup(true);
                console.log(ev);
              }}
            >
              {w.text}
            </Text>
          ));
        }}
      </Wordcloud>
      {/* {showPopup && (
          <div className="absolute rounded-md bg-themelapislazuli p-5 text-white"></div>
        )} */}
    </div>
  );
}

{
  /* <style>{`
.wordcloud {
  display: flex;
  flex-direction: column;
  user-select: none;
}
.wordcloud svg {
  margin: 1rem 0;
  cursor: pointer;
}

.wordcloud label {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  margin-right: 8px;
}
.wordcloud textarea {
  min-height: 100px;
}
`}</style> */
}
