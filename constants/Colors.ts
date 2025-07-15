/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Background } from "@react-navigation/elements";

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: "#0F1417",
    primary60: "rgba(255, 101, 98, 0.6)",
    primary20: "rgba(255, 101, 98, 0.2)",
    primary10: "rgba(255, 101, 98, 0.1)",

    gray1: "#828282",
    gray2: "#BDBDBD",
    gray3: "#E0E0E0",
    gray4: "#EDEDED",
    gray5: "#F6F6F6",

    success: "#27AE60",
    warning: "#E2B93B",
    error: "#EB5757",
    info: "#2F80ED",

    black: "#1D1D1D",
    white: "#FFFFFF",
    text:'#1D1D1D',
    background: '#F6F6F6',
  },
  dark: {
    text: "#FFFFFF",
    background: "#151718",

    primary: "#FF6562",
    primary60: "rgba(255, 101, 98, 0.6)",
    primary20: "rgba(255, 101, 98, 0.2)",
    primary10: "rgba(255, 101, 98, 0.1)",

    gray1: "#BAC2C6",
    gray2: "#9EA3A5",
    gray3: "#2D3032",
    gray4: "#323537",
    gray5: "#151718",

    success: "#27AE60",
    warning: "#E2B93B",
    error: "#EB5757",
    info: "#2F80ED",

    black: "#FFFFFF",
    white: "#1D1D1D",// 이거 메인에서 수정
  },
};
