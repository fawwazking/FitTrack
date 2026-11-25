import { FadeIn, Layout, SlideInDown } from 'react-native-reanimated';
import { useTheme } from './theme';

/**
 * Stagger motion presets (ui-ux-pro-max skill, motion dial 5/10 = Standard).
 * Respects the OS "Reduce Motion" setting — when on, each preset is `undefined`
 * so the element renders immediately in its final state.
 *
 * Usage (screen-level fade):
 *   const { screenEntering } = useMotionPresets();
 *   <Animated.View entering={screenEntering}>…</Animated.View>
 *
 * ponytail: 3 presets only. Add Flip/SplitText when a screen needs them.
 */
export function useMotionPresets() {
  const { reducedMotion } = useTheme();
  return {
    /** Fade a container in on mount (200ms spring). */
    screenEntering: reducedMotion ? undefined : FadeIn.duration(200).springify(),
    /** Stagger a list item (Layout + spring, ~300ms). Pair with staggerDelay(). */
    itemEntering: reducedMotion ? undefined : Layout.duration(300).springify(),
    /** Slide a bottom sheet in (250ms spring). */
    sheetEntering: reducedMotion ? undefined : SlideInDown.springify().duration(250),
  };
}

/**
 * Per-item delay for a staggered list (60ms between items, capped at 600ms).
 * Returns 0 when reducedMotion is on.
 */
export function staggerDelay(index: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return Math.min(index * 60, 600);
}
