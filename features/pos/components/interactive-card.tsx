import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

type InteractiveCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hoverScale?: number;
};

export function InteractiveCard({
  children,
  style,
  onPress,
  onLongPress,
  disabled = false,
  hoverScale = 1.02,
}: InteractiveCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    Animated.timing(scale, {
      toValue: value,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }

  useEffect(() => {
    return () => {
      scale.stopAnimation();
    };
  }, [scale]);

  return (
    <Pressable
      disabled={disabled}
      onHoverIn={() => animateTo(hoverScale)}
      onHoverOut={() => animateTo(1)}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => animateTo(0.99)}
      onPressOut={() => animateTo(1)}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
