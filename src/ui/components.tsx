import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { isWeb } from '../db/db';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, FONT_FAMILY, type Theme } from './theme';

export type IconName = keyof typeof Ionicons.glyphMap;

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'caption';

export function Txt({
  children,
  variant = 'body',
  color,
  weight,
  center,
  numberOfLines,
  style,
}: {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  weight?: TextStyle['fontWeight'];
  center?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const base = useMemo<TextStyle>(() => {
    const fontMap: Record<TextVariant, { size: number; weight: TextStyle['fontWeight']; family: string }> = {
      h1: { size: theme.font.h1, weight: '700', family: FONT_FAMILY.bold },
      h2: { size: theme.font.h2, weight: '700', family: FONT_FAMILY.semiBold },
      h3: { size: theme.font.h3, weight: '600', family: FONT_FAMILY.semiBold },
      label: { size: theme.font.label, weight: '700', family: FONT_FAMILY.bold },
      caption: { size: theme.font.label, weight: '500', family: FONT_FAMILY.medium },
      small: { size: theme.font.small, weight: '400', family: FONT_FAMILY.regular },
      body: { size: theme.font.body, weight: '400', family: FONT_FAMILY.regular },
    };
    const v = fontMap[variant] ?? fontMap.body;
    const lineHeight = variant === 'body' ? v.size * 1.45 : variant === 'small' ? v.size * 1.4 : v.size * 1.25;
    return {
      fontSize: v.size,
      fontWeight: v.weight,
      fontFamily: v.family,
      lineHeight,
      ...(variant === 'label' ? { letterSpacing: 0.5, textTransform: 'uppercase' as const } : {}),
    };
  }, [variant, theme]);
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        base,
        { color: color ?? (variant === 'caption' ? theme.colors.textMuted : theme.colors.text) },
        center && { textAlign: 'center' },
        weight && { fontWeight: weight },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  const theme = useTheme();
  const contentStyle: ViewStyle = {
    padding: padded ? theme.spacing.lg : 0,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.header, { borderColor: theme.colors.border }]}>
      {onBack ? (
        <IconButton name="chevron-back" label="Kembali" onPress={onBack} />
      ) : (
        <View style={{ width: 48 }} />
      )}
      <View style={{ flex: 1 }}>
        <Txt variant="h2" numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? <View style={{ width: 48 }} />}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  };
  if (onPress) {
    if (isWeb) {
      // ponytail: use div+role instead of button on web to avoid nested <button>
      // (react-native-web renders Pressable as <button>; upgrade: custom web Card
      // with onClick when we need proper focus/keyboard semantics)
      return (
        <View style={[cardStyle, style, { cursor: 'pointer' }]}>
          <View style={{ flex: 1, gap: theme.spacing.md }}>
            {children}
          </View>
        </View>
      );
    }
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, style, pressed && { opacity: 0.8 }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}

export function Row({
  children,
  style,
  justify = 'space-between',
  align = 'center',
  gap,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  gap?: number;
}) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: justify, alignItems: align, gap }, style]}>
      {children}
    </View>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }} />;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  fullWidth = true,
  small,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  small?: boolean;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const palette = {
    primary: { bg: theme.colors.primary, fg: theme.colors.primaryText, border: theme.colors.primary },
    secondary: { bg: theme.colors.surfaceAlt, fg: theme.colors.text, border: theme.colors.border },
    ghost: { bg: 'transparent', fg: theme.colors.primary, border: 'transparent' },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger, border: theme.colors.danger },
  }[variant];
  const minHeight = small ? 44 : 48;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: Boolean(disabled || loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'ghost' ? 0 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
          <Text
            style={{
              color: palette.fg,
              fontSize: theme.font.body,
              fontWeight: '700',
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
  color,
  size = 22,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={name} size={size} color={color ?? theme.colors.text} />
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  suffix,
  multiline,
  autoFocus,
  maxLength,
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string | null;
  suffix?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  onSubmitEditing?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="caption" weight="600">
        {label}
      </Txt>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          minHeight: 48,
        }}
      >
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
          style={{
            flex: 1,
            color: theme.colors.text,
            fontSize: theme.font.body,
            paddingVertical: theme.spacing.md,
            minHeight: multiline ? 92 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
        {suffix ? (
          <Txt variant="small" color={theme.colors.textMuted}>
            {suffix}
          </Txt>
        ) : null}
      </View>
      {error ? (
        <Txt variant="caption" color={theme.colors.danger}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  unit,
  error,
  integer,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  error?: string | null;
  integer?: boolean;
}) {
  const theme = useTheme();
  const adjust = (direction: 1 | -1) => {
    const current = Number(value.replace(',', '.')) || 0;
    let next = current + direction * step;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    if (integer) next = Math.round(next);
    onChange(String(Number(next.toFixed(2))));
  };
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="caption" weight="600">
        {label}
      </Txt>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${'Kurangi'}`}
          onPress={() => adjust(-1)}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="remove" size={22} color={theme.colors.text} />
        </Pressable>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          style={{
            flex: 1,
            textAlign: 'center',
            color: theme.colors.text,
            fontSize: theme.font.h3,
            fontWeight: '600',
            paddingVertical: theme.spacing.md,
          }}
        />
        {unit ? (
          <Txt variant="small" color={theme.colors.textMuted}>
            {unit}
          </Txt>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${'Tambah'}`}
          onPress={() => adjust(1)}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="add" size={22} color={theme.colors.text} />
        </Pressable>
      </View>
      {error ? (
        <Txt variant="caption" color={theme.colors.danger}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(selected), disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
      })}
    >
      <Txt
        variant="small"
        weight="600"
        color={selected ? theme.colors.primary : theme.colors.text}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

export function SelectCard({
  title,
  subtitle,
  selected,
  disabled,
  onPress,
  right,
  badge,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  right?: ReactNode;
  badge?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: Boolean(selected), disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        gap: 4,
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
      })}
    >
      <Row>
        <Row gap={8} style={{ flex: 1 }}>
          <Txt variant="h3">{title}</Txt>
          {badge ? <Badge label={badge} /> : null}
        </Row>
        {right ?? (selected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null)}
      </Row>
      {subtitle ? (
        <Txt variant="small" color={theme.colors.textMuted}>
          {subtitle}
        </Txt>
      ) : null}
    </Pressable>
  );
}

export function ProgressBar({
  value,
  max,
  color,
  height = 8,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const theme = useTheme();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: Math.round(max), now: Math.round(value) }}
      style={{ height, borderRadius: height, backgroundColor: theme.colors.track, overflow: 'hidden' }}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color ?? theme.colors.primary,
        }}
      />
    </View>
  );
}

export function CalorieRing({
  consumed,
  target,
  size = 176,
  label,
}: {
  consumed: number;
  target: number;
  size?: number;
  label?: string;
}) {
  const theme = useTheme();
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? Math.min(1, consumed / target) : 0;
  const over = consumed > target && target > 0;
  const color = over ? theme.colors.warning : theme.colors.primary;
  const remaining = Math.round(target - consumed);
  const shown = Math.abs(remaining);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: Math.round(target), now: Math.round(consumed) }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Txt variant="h1" style={{ fontSize: 34 }}>
        {shown}
      </Txt>
      <Txt variant="caption" color={theme.colors.textMuted}>
        {over ? 'Lebih dari target' : 'Sisa kalori'}
      </Txt>
    </View>
  );
}

export function MacroBar({
  label,
  consumed,
  target,
  color,
  unit = 'g',
}: {
  label: string;
  consumed: number;
  target: number;
  color?: string;
  unit?: string;
}) {
  const theme = useTheme();
  const over = consumed > target && target > 0;
  const tone = over ? theme.colors.warning : color ?? theme.colors.primary;
  return (
    <View style={{ gap: 4 }}>
      <Row>
        <Txt variant="small" weight="600">
          {label}
        </Txt>
        <Txt variant="small" color={theme.colors.textMuted}>
          {Math.round(consumed)} / {Math.round(target)} {unit}
        </Txt>
      </Row>
      <ProgressBar value={consumed} max={target} color={tone} height={7} />
    </View>
  );
}

export function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Txt variant="caption" color={theme.colors.textMuted}>
        {label}
      </Txt>
      <Txt variant="h3" color={color}>
        {value}
      </Txt>
      {sub ? (
        <Txt variant="caption" color={theme.colors.textMuted}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

export function Badge({
  label,
  tone = 'primary',
}: {
  label: string;
  tone?: 'primary' | 'warning' | 'danger' | 'success';
}) {
  const theme = useTheme();
  const palette = {
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger },
    success: { bg: theme.colors.primarySoft, fg: theme.colors.success },
  }[tone];
  return (
    <View
      style={{
        backgroundColor: palette.bg,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
      }}
    >
      <Txt variant="caption" weight="700" color={palette.fg}>
        {label}
      </Txt>
    </View>
  );
}

export function Banner({
  title,
  children,
  tone = 'info',
  action,
}: {
  title?: string;
  children: ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'success';
  action?: ReactNode;
}) {
  const theme = useTheme();
  const palette = {
    info: { bg: theme.colors.surfaceAlt, border: theme.colors.border, fg: theme.colors.text },
    warning: { bg: theme.colors.warningSoft, border: theme.colors.warning, fg: theme.colors.warning },
    danger: { bg: theme.colors.dangerSoft, border: theme.colors.danger, fg: theme.colors.danger },
    success: { bg: theme.colors.primarySoft, border: theme.colors.primary, fg: theme.colors.primary },
  }[tone];
  return (
    <View
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      {title ? (
        <Txt variant="h3" color={palette.fg}>
          {title}
        </Txt>
      ) : null}
      <Txt variant="small" color={palette.fg}>
        {children}
      </Txt>
      {action}
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon = 'sparkles-outline',
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xl }}>
      <Ionicons name={icon} size={32} color={theme.colors.textMuted} />
      <Txt variant="h3" center>
        {title}
      </Txt>
      {body ? (
        <Txt variant="small" color={theme.colors.textMuted} center>
          {body}
        </Txt>
      ) : null}
      {action}
    </View>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Row>
        <Txt variant="h3">{title}</Txt>
        {action}
      </Row>
      {children}
    </View>
  );
}

export function AppModal({
  visible,
  title,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' }}>
        {isWeb ? (
          <View style={{ flex: 1 }} onClick={onClose} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup"
            style={{ flex: 1 }}
            onPress={onClose}
          />
        )}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.lg,
            maxHeight: '88%',
          }}
        >
          <Row>
            <Txt variant="h2" style={{ flex: 1 }}>
              {title}
            </Txt>
            <IconButton name="close" label="Tutup" onPress={onClose} />
          </Row>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: theme.spacing.lg }}>
            {children}
          </ScrollView>
          {footer}
        </View>
      </View>
    </Modal>
  );
}

export function LoadingView() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export function colorForMacro(theme: Theme, key: 'protein' | 'carbs' | 'fat'): string {
  return theme.colors[key];
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 4,
  },
});
