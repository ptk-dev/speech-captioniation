import { canUseWhisperWeb, downloadWhisperModel, resampleTo16Khz, transcribe } from "@remotion/whisper-web";

export async function transcribeAudio(
    audioFileUrl: string) {
    const blob = await fetch(audioFileUrl).then((res) => res.blob());
    const file = new File([blob], audioFileUrl.split("/").reverse()[0], { type: blob.type });

    const modelToUse = 'tiny.en';

    const { supported, detailedReason } = await canUseWhisperWeb(modelToUse);
    if (!supported) {
        throw new Error(`Whisper Web is not supported in this environment: ${detailedReason}`);
    }

    console.log('Downloading model...');
    await downloadWhisperModel({
        model: modelToUse,
        onProgress: ({ progress }) => console.log(`Downloading model (${Math.round(progress * 100)}%)...`),
    });

    console.log('Resampling audio...');
    const channelWaveform = await resampleTo16Khz({
        file,
        onProgress: (p) => console.log(`Resampling audio (${Math.round(p * 100)}%)...`),
    });

    console.log('Transcribing...');
    const { transcription } = await transcribe({
        channelWaveform,
        model: modelToUse,
        onProgress: (p) => console.log(`Transcribing (${Math.round(p * 100)}%)...`)
    });

    return transcription
}