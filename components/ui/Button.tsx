import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, radius, spacing, typography } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  flex?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  flex = false,
}: ButtonProps) {
  const primary = useThemeColor(
    { light: colors.light.primary, dark: colors.dark.primary },
    'tint',
  );
  const border = useThemeColor(
    { light: colors.light.border, dark: colors.dark.border },
    'text',
  );
  const textOnPrimary = useThemeColor(
    { light: colors.light.textOnPrimary, dark: colors.dark.textOnPrimary },
    'text',
  );
  const errorColor = useThemeColor(
    { light: colors.light.deleteText, dark: colors.dark.deleteText },
    'text',
  );
  const errorBg = useThemeColor(
    { light: colors.light.deleteBg, dark: colors.dark.deleteBg },
    'background',
  );
  const errorBorder = useThemeColor(
    { light: colors.light.deleteBorder, dark: colors.dark.deleteBorder },
    'text',
  );

  const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle; iconColor: string }> = {
    primary: {
      container: { backgroundColor: primary, borderColor: primary },
      text: { color: textOnPrimary },
      iconColor: textOnPrimary,
    },
    secondary: {
      container: { backgroundColor: 'transparent', borderColor: border },
      text: { color: primary },
      iconColor: primary,
    },
    destructive: {
      container: { backgroundColor: errorBg, borderColor: errorBorder },
      text: { color: errorColor },
      iconColor: errorColor,
    },
    ghost: {
      container: { backgroundColor: 'transparent', borderColor: 'transparent' },
      text: { color: primary },
      iconColor: primary,
    },
  };

  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        v.container,
        flex && styles.flex,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text.color as string} />
      ) : (
        <>
          {icon && (
            <MaterialIcons name={icon} size={18} color={v.iconColor} />
          )}
          <Text style={[styles.text, v.text, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  flex: {
    flex: 1,
  },
  text: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
