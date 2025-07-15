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
  style?:any;
  contentColor? : string;
}

const CustomHeader = (props:CustomHeader) => {
  const {title, onPressLeftIcon, style, contentColor} = props;

  const color = useThemeColor({light:colors.black, dark:colors.white},'text');

  return (
    <S.Layout style={style}>
      <S.TitleContainer>
        <Pressable 
          style={[{width: 24, height: 24}]} 
          onPress={onPressLeftIcon}
        >
          <CustomIcon type='arrow' size='24' style={{color:contentColor ?? color}}/>
        </Pressable>
          <ThemedText type="bodyMedium" style={{color:contentColor ?? color}}>{title}</ThemedText>
      </S.TitleContainer>

    </S.Layout>
  )
}

export default CustomHeader