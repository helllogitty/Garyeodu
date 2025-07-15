import React, { ReactNode } from "react";
import * as S from "./style";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/common/useThemeColor";
import CustomHeader from "../CustomHeader";
interface CustomViewType {
  title: string;
  onPressLeftIcon: () => void;
  icon?: "arrow" | "cancel" | "home" | "upload" | "my";
  children?: ReactNode;
  themeType?: "Normal" | "Bright" | undefined;
}

const CustomView = (props: CustomViewType) => {
  const color = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );
  const grayscale = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.white },
    "text"
  );
  const { title, onPressLeftIcon, children, themeType, icon } =
    props;
  return (
    <S.SafeView
      style={{ backgroundColor: themeType === "Bright" ? grayscale : color }}
    >
      <S.Container type={themeType}>
        <CustomHeader
          title={title}
          onPressLeftIcon={onPressLeftIcon}
          icon={icon}
        />

        {children}
      </S.Container>
    </S.SafeView>
  );
};

export default CustomView;
