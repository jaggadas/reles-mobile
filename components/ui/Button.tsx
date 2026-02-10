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
import { colors, radius, spacing, typography } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type Size = 'default' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
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
  size = 'default',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  flex = false,
}: ButtonProps) {
  const primary = colors.primary;
  const border = colors.border;
  const textOnPrimary = colors.textOnPrimary;
  const errorColor = colors.deleteText;
  const errorBg = colors.deleteBg;
  const errorBorder = colors.deleteBorder;

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
  const isLg = size === 'lg';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isLg && styles.baseLg,
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
            <MaterialIcons name={icon} size={isLg ? 20 : 18} color={v.iconColor} />
          )}
          <Text style={[styles.text, isLg && styles.textLg, v.text, textStyle]}>{title}</Text>
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
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  baseLg: {
    height: 56,
    borderRadius: radius.lg,
  },
  flex: {
    flex: 1,
  },
  text: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  textLg: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
