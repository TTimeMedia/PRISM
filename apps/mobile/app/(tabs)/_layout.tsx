import React from 'react';
import { Tabs } from 'expo-router';
import { Sun, HeartPulse, Compass, CircleUserRound } from 'lucide-react-native';
import { PRISMBottomNav, type PRISMBottomNavItem } from '@prism/ui';
import { SideMenuProvider } from '../../components/home/SideMenu';

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

/** Tabs that hold a stack of screens, whose main page is 'index'. */
const STACK_TABS = new Set(['care', 'journey', 'you']);

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
        if (event.defaultPrevented) return;
        // A tab always shows exactly its own main page: anything opened inside
        // it is closed back to that page, and tapping the tab you're on does
        // nothing more. (Navigating to the main page by name could add a copy
        // of it, or land elsewhere, depending on what had been opened before.)
        const inner = route.state as { key?: string; index?: number } | undefined;
        if (STACK_TABS.has(route.name) && inner?.key && (inner.index ?? 0) > 0) {
          navigation.dispatch({ type: 'POP_TO_TOP', target: inner.key });
        }
        if (!focused) {
          navigation.navigate(route.name);
        }
      },
    };
  });

  return <PRISMBottomNav items={items} />;
}

export default function TabLayout() {
  return (
    <SideMenuProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        // Leaving a tab returns it to its home screen, so tapping a tab always
        // shows that tab's main page, not whichever screen was open last.
        screenOptions={{ headerShown: false, popToTopOnBlur: true }}
      >
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
    </SideMenuProvider>
  );
}
