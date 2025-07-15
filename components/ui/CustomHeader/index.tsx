import * as S from './style'
import { HeaderTitle } from '@react-navigation/elements'
import React from 'react'
import { Pressable } from 'react-native';
import CustomIcon from '../CustomIcon';
import { useThemeColor } from '@/hooks/common/useThemeColor';
import colors from '@/styles/colors';
import { ThemedText } from '@/components/ThemedText';

interface CustomHeader {
  title:string;
  onPressLeftIcon:()=>void;
  icon?: "arrow" | "cancel" | "home" | "upload" | "my";
  style?:any;
  contentColor? : string;
}

const CustomHeader = (props:CustomHeader) => {
  const {title, onPressLeftIcon, style, contentColor, icon} = props;

  const color = useThemeColor({light:colors.black, dark:colors.white},'text');

  return (
    <S.Layout style={style}>
      <S.IconContainer>
        <Pressable 
          onPress={onPressLeftIcon}
        >
          <CustomIcon type={icon ?? 'arrow' as any} size='24' style={{color:contentColor ?? color}}/>
        </Pressable>
      </S.IconContainer>
      <S.TitleContainer>
        <ThemedText type="bodyNormal" style={{color:contentColor ?? color}}>{title}</ThemedText>
      </S.TitleContainer>
    </S.Layout>
  )
}

export default CustomHeader