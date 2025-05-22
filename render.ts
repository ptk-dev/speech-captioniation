import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { enableTailwind } from '@remotion/tailwind-v4';


async function Render(id: string) {

    // The composition you want to render
    const compositionId = 'Audiogram';

    // You only have to create a bundle once, and you may reuse it
    // for multiple renders that you can parametrize using input props.
    const bundleLocation = await bundle({
        entryPoint: path.resolve('./src/index.ts'),
        // If you have a webpack override in remotion.config.ts, pass it here as well.
        webpackOverride: (config) => enableTailwind(config),
        onProgress: (progress) => {
            console.log(`Bundle progress: ${progress}%`);
        }
    });

    // Parametrize the video by passing props to your component.
    const inputProps = {
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
        id
    };

    // Get the composition you want to render. Pass `inputProps` if you
    // want to customize the duration or other metadata.
    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps,
        timeoutInMilliseconds: 1000*60*30, // 30 minutes
    });

    // Render the video. Pass the same `inputProps` again
    // if your video is parametrized with data.
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: `out/${compositionId}.mp4`,
        inputProps,
        onProgress: (progress) => {
            console.log(`Render progress: ${progress}%`);
        },
        timeoutInMilliseconds: 1000*60*30, // 30 minutes,
        chromiumOptions: {
            disableWebSecurity: true,
            ignoreCertificateErrors: true
        }
    });

    console.log('Render done!');
}

export { Render }