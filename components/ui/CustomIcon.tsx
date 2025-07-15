import React from 'react';
import { useThemeColor } from '@/hooks/common/useThemeColor';
import colors from '@/styles/colors';

// SVG 파일들을 컴포넌트로 import
import ArrowIcon from '../../assets/icons/arrow.svg';
import CancelIcon from '../../assets/icons/cancel.svg';
import HomeIcon from '../../assets/icons/home.svg';
import UploadIcon from '../../assets/icons/upload.svg';
import MyIcon from '../../assets/icons/my.svg';
import PicIcon from '../../assets/icons/pic.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import MosaicIcon from '../../assets/icons/mosaic.svg';
import AiIcon from '../../assets/icons/ai.svg';

interface CustomIconType {
  type: "arrow" | "cancel" | "home" | "upload" | "my" | "pic" | "camera" | "mosaic" | "ai";
  size?: string;
  style?: any;
}

const iconMap = {
  arrow: ArrowIcon,
  cancel: CancelIcon,
  home: HomeIcon,
  upload: UploadIcon,
  my: MyIcon,
  pic: PicIcon,
  camera: CameraIcon,
  mosaic: MosaicIcon,
  ai: AiIcon,
};

const CustomIcon = ({ type, size = '24', style }: CustomIconType) => {
  const color = useThemeColor(
    { light: colors.black, dark: colors.white },
    "text"
  );

  const IconComponent = iconMap[type];

  if (!IconComponent) return null;

  return (
    <IconComponent
      width={size}
      height={size}
      fill={type === 'mosaic' ? 'none' : (style?.color ?? color)}
      stroke={type === 'mosaic' ? (style?.color ?? color) : undefined}
      style={style}
    />
  );
};

export default CustomIcon;
