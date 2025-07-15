import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/common/useThemeColor';

export type ThemedTextProps = TextProps & {
  style?:any,
  lightColor?: string;
  darkColor?: string;
  type?: 'bodyMedium' | 'bodyNormal' | 'bodySmall1' | 'bodySmall2' | 'bodyExtraSmall' | 'HeadingNormal' | 'HeadingSmall';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'bodyNormal',
  ...rest
}: ThemedTextProps) {

  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'bodyMedium' ? styles.bodyMedium : undefined,
        type === 'bodyNormal' ? styles.bodyNormal : undefined,
        type === 'bodySmall1' ? styles.bodySmall1 : undefined,
        type === 'bodySmall2' ? styles.bodySmall2 : undefined,
        type === 'bodyExtraSmall' ? styles.bodyExtraSmall : undefined,
        type === 'HeadingNormal' ? styles.headingNormal : undefined,
        type === 'HeadingSmall' ? styles.headingSmall : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
    // Body
    bodyMedium: {
      fontSize: 18,
      fontFamily: 'Pretendard-Semibold',
    },
    bodyNormal: {
      fontSize: 16,
      fontFamily: 'Pretendard-Medium',
    },
    bodySmall1: {
      fontSize: 14,
      fontFamily: 'Pretendard-Medium',
    },
    bodySmall2: {
      fontSize: 14,
      fontFamily: 'Pretendard-Regular',
    },
    bodyExtraSmall: {
      fontSize: 12,
      fontFamily: 'Pretendard-Regular',
    },
  
    // Heading
    headingNormal: {
      fontSize: 32,
      fontFamily: 'Pretendard-SemiBold',
    },
    headingSmall: {
      fontSize: 20,
      fontFamily: 'Pretendard-SemiBold',
    },
});
