import React from "react";
import { useThemeColor } from "@/hooks/common/useThemeColor";
import colors from "@/styles/colors";
import { SvgXml } from 'react-native-svg';

// 또는 require로 시도
const ArrowIcon = require("@/assets/icons/arrow.svg").default;
const CancelIcon = require("@/assets/icons/cancel.svg").default;
const HomeIcon = require("@/assets/icons/home.svg").default;
const UploadIcon = require("@/assets/icons/upload.svg").default;
const MyIcon = require("@/assets/icons/my.svg").default;

interface CustomIconType {
  size: string; // 아이콘 사이즈
  type: "arrow" | "cancel" | "home" | "upload" | "my"; // 아이콘 이름
  style?: any;
  onPress?: () => void;
}

const iconMap = {
  arrow: ArrowIcon,
  cancel: CancelIcon,
  home: HomeIcon,
  upload: UploadIcon,
  my: MyIcon,
};

const CustomIcon = (props: CustomIconType) => {
  const { size, type, style } = props;
  const color = useThemeColor(
    { light: colors.white, dark: colors.black },
    "text"
  ); //useThemeColor 훅 사용

  const IconComponent = type ? iconMap[type] : undefined;

  return (

      IconComponent && (
        <IconComponent
        // @ts-ignore
          style={{ color: style?.color ?? color }}
          width={size}
          height={size}
        />
      )
  );
};

export default CustomIcon;
