import { View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
};

export function ThemedView({ style, lightColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = lightColor ?? colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
