import { useThemeColor } from '@/hooks/common/useThemeColor';
import colors from '@/styles/colors';
import React from 'react';

// SVG 파일들을 컴포넌트로 import
import AiIcon from '../../assets/icons/ai.svg';
import ArrowIcon from '../../assets/icons/arrow.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import CancelIcon from '../../assets/icons/cancel.svg';
import HomeIcon from '../../assets/icons/home.svg';
import MosaicIcon from '../../assets/icons/mosaic.svg';
import MyIcon from '../../assets/icons/my.svg';
import PicIcon from '../../assets/icons/pic.svg';
import UploadIcon from '../../assets/icons/upload.svg';

interface CustomIconType {
  type: "arrow" | "cancel" | "home" | "upload" | "my" | "pic" | "camera" | "mosaic" | "ai";
  size?: string | number;
  style?: any;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  ai: AiIcon,
  mosaic: MosaicIcon,
  arrow: ArrowIcon,
  cancel: CancelIcon,
  home: HomeIcon,
  upload: UploadIcon,
  my: MyIcon,
  pic: PicIcon,
  camera: CameraIcon,
};

const CustomIcon = ({ type, size = '24', style }: CustomIconType) => {
  const color = useThemeColor(
    { light: colors.black, dark: colors.white },
    "text"
  );

  const IconComponent = iconMap[type];

  // 컴포넌트가 없거나 유효하지 않은 경우 체크
  if (!IconComponent) {
    console.warn(`아이콘 '${type}'을 찾을 수 없습니다.`);
    return null;
  }

  // 타입 검증
  if (typeof IconComponent !== 'function' && typeof IconComponent !== 'object') {
    console.error(`아이콘 '${type}'이 유효한 React 컴포넌트가 아닙니다:`, typeof IconComponent, IconComponent);
    return null;
  }

  // size를 문자열로 변환
  const iconSize = typeof size === 'number' ? size.toString() : size;
  const iconColor = style?.color ?? color;

  // stroke 기반 아이콘들
  const strokeIcons = ['mosaic'];
  const isStrokeIcon = strokeIcons.includes(type);

  try {
    return (
      <IconComponent
        width={iconSize}
        height={iconSize}
        fill={isStrokeIcon ? 'none' : iconColor}
        stroke={isStrokeIcon ? iconColor : undefined}
        style={style}
      />
    );
  } catch (error) {
    console.error(`아이콘 '${type}' 렌더링 중 오류 발생:`, error);
    return null;
  }
};

export default CustomIcon;