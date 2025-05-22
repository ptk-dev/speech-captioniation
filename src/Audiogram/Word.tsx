import { Easing, useVideoConfig } from "remotion";
import { interpolate } from "remotion";
import React, { useMemo } from "react";
import { Caption } from "@remotion/captions";
import { msToFrame } from "../helpers/ms-to-frame";
import nlp from "compromise";

export const Word: React.FC<{
  readonly item: Caption;
  readonly frame: number;
  readonly transcriptionColor: string;
}> = ({ item, frame, transcriptionColor }) => {
  const fps = useVideoConfig().fps
  const opacity = interpolate(
    frame,
    [msToFrame(item.startMs) - 2 * fps, msToFrame(item.startMs)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const blur = interpolate(
    frame,
    [msToFrame(item.startMs) - fps, msToFrame(item.startMs)],
    [50, 0],
    {
      easing: Easing.out(Easing.linear),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const verbs = nlp(item.text).verbs().out('array').length > 0;
  const nouns = nlp(item.text).nouns().out('array').length > 0;
  const adjectives = nlp(item.text).adjectives().out('array').length > 0;

  const style: React.CSSProperties = useMemo(() => {
    return {
      display: "inline-block",
      whiteSpace: "pre",
      opacity,
      color: verbs ? "#FFC72C" : nouns ? "#00B2FF" : adjectives ? "#25D366" : transcriptionColor,
      filter: `blur(${blur}px)`,
    };
  }, [opacity, verbs, nouns, adjectives, transcriptionColor, blur]);


  return <span style={style}>{item.text}</span>;
};
