import React from 'react';
import { Tabs } from 'expo-router';
import { Sun, HeartPulse, Compass, CircleUserRound } from 'lucide-react-native';
import { PRISMBottomNav, type PRISMBottomNavItem } from '@prism/ui';

// Derived from <Tabs>'s own `tabBar` prop rather than imported from
// @react-navigation/bottom-tabs directly — expo-router wraps that
// library with its own, slightly different-but-compatible types, and
// this stays correct across expo-router versions without depending on
// its internal (non-exported) type paths.
type TabBarProps =
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']> extends (
    props: infer P,
  ) => React.ReactNode
    ? P
    : never;

/**
 * PRISM has exactly four primary destinations — TODAY / CARE / JOURNEY /
 * YOU — and no fifth tab is added without revising the specification.
 * See docs/MASTER_BUILD_SPEC.md §04.
 */
function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const items: PRISMBottomNavItem[] = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const label =
      typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);

    return {
      key: route.key,
      label,
      focused,
      icon: (options.tabBarIcon as PRISMBottomNavItem['icon']) ?? (() => null),
      onPress: () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!focused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      },
    };
  });

  return <PRISMBottomNav items={items} />;
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Sun color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: 'Care',
          tabBarIcon: ({ color, size }) => <HeartPulse color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color, size }) => <CircleUserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
