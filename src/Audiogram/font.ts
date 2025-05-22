import { loadFont, fontFamily } from "@remotion/google-fonts/Montserrat";

const loading = loadFont("normal", {
  weights: ["500", "600"],
});

export const FONT_FAMILY = fontFamily;

export const waitForFonts = async () => {
  await loading.waitUntilDone();
};
