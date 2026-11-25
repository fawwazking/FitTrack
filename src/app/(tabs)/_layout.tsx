import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { IconName } from '../../ui/components';
import { t } from '../../i18n';
import { useTheme } from '../../ui/theme';

function tabIcon(active: IconName, inactive: IconName) {
  return function TabBarIcon({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color as string} />;
  };
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: { fontSize: theme.font.label },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.nav.home, tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="food"
        options={{ title: t.nav.food, tabBarIcon: tabIcon('restaurant', 'restaurant-outline') }}
      />
      <Tabs.Screen
        name="workout"
        options={{ title: t.nav.workout, tabBarIcon: tabIcon('barbell', 'barbell-outline') }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: t.nav.progress, tabBarIcon: tabIcon('trending-up', 'trending-up-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t.nav.profile, tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
