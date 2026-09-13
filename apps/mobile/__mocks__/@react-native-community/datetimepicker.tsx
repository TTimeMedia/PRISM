import React from 'react';
import { Pressable, Text, View } from 'react-native';

/**
 * Jest manual mock for the native date/time picker (Jest auto-uses any
 * `__mocks__/<package>` file for a node_modules package, no `jest.mock()`
 * needed). The real picker is a native view that can't render under Jest;
 * this renders two accessible, deterministic stand-ins so component tests
 * can simulate the user confirming or dismissing a selection without
 * depending on native UI. `MOCK_PICKED_DATE` gives tests a fixed value to
 * assert against.
 */
export const MOCK_PICKED_DATE = new Date(2026, 5, 15, 9, 5, 0);

export interface MockDateTimePickerProps {
  testID?: string;
  onChange?: (event: { type: 'set' | 'dismissed' }, date?: Date) => void;
}

export default function MockDateTimePicker({ testID, onChange }: MockDateTimePickerProps) {
  const base = testID ?? 'mock-datetimepicker';
  return (
    <View testID={base}>
      <Pressable
        testID={`${base}-confirm`}
        accessibilityRole="button"
        onPress={() => onChange?.({ type: 'set' }, MOCK_PICKED_DATE)}
      >
        <Text>confirm</Text>
      </Pressable>
      <Pressable
        testID={`${base}-dismiss`}
        accessibilityRole="button"
        onPress={() => onChange?.({ type: 'dismissed' }, undefined)}
      >
        <Text>dismiss</Text>
      </Pressable>
    </View>
  );
}
