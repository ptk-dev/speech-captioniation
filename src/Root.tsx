import "./index.css";
import { Composition, staticFile } from "remotion";
import { Audiogram } from "./Audiogram/Main";
import { audiogramSchema } from "./Audiogram/schema";
import { FPS } from "./helpers/ms-to-frame";
import { parseMedia } from "@remotion/media-parser";
import { Caption } from "@remotion/captions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Audiogram"
        component={Audiogram}
        width={1920}
        height={1080}
        schema={audiogramSchema}
        defaultProps={{
          // audio settings
          audioOffsetInSeconds: 0,
          audioFileUrl: null,
          // podcast data
          titleText: "Steve Jobs Commencement Speech",
          titleColor: "rgba(186, 186, 186, 0.93)",
          // captions settings
          captions: null,
          onlyDisplayCurrentSentence: false,
          captionsTextColor: "rgba(255, 255, 255, 0.93)",
          id: "1lEnMmH9qh4"
        }}
        // Determine the length of the video based on the duration of the audio file
        calculateMetadata={async ({ props }) => {
          try {
            const audioFileUrl = staticFile(await (await fetch(`http://localhost:4000/download?url=${props.id}`)).text());
            console.log("Audio file URL:", audioFileUrl);
            const captions = await (await fetch(`http://localhost:4000/transcribe?id=${props.id}`)).json() as Caption[]

            const { slowDurationInSeconds } = await parseMedia({
              src: audioFileUrl,
              acknowledgeRemotionLicense: true,
              fields: {
                slowDurationInSeconds: true,
              },
            });

            return {
              durationInFrames: FPS*2 || Math.floor(
                (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS,
              ),
              props: {
                ...props,
                captions,
                audioFileUrl
              },
              fps: FPS,
            };
          } catch (e) {
            console.error("Error fetching audio file", e);
            return {
              durationInFrames: FPS*Math.floor(
                (props.audioOffsetInSeconds) * FPS,
              ),
              props: {
                ...props,
                },
              fps: FPS,
            } 
          }

        }}
      />
    </>
  );
};
