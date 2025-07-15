import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/common/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type? : 'Normal' | 'Bright';
};

export function ThemedView({ style, lightColor, darkColor, type='Normal', ...otherProps }: ThemedViewProps) {
  const color = type === 'Normal' ? 'background' : 'white';
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, color);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
