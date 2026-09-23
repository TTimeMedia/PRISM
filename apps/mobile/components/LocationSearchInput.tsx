import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { PRISMInput, spacing, type, useTheme } from '@prism/ui';
import {
  isLocationSearchAvailable,
  searchLocations,
  type LocationSuggestion,
} from '../modules/prism-location-search';

export interface LocationSearchInputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
}

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 250;

/**
 * A location field with Apple Maps-style suggestions as you type (MapKit
 * autocomplete — see modules/prism-location-search). Picking a suggestion
 * fills the field with "Name, address"; typing something of your own is
 * always fine. Where MapKit isn't available (Android, Expo Go) this is
 * just a plain text field.
 */
export function LocationSearchInput({
  label = 'Location',
  value,
  onChangeText,
  onBlur,
}: LocationSearchInputProps) {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const skipNextSearch = useRef(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    if (!isLocationSearchAvailable || !focused) return;

    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    const request = ++latestRequest.current;
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        if (request === latestRequest.current) setSuggestions(results);
      } catch {
        if (request === latestRequest.current) setSuggestions([]);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, focused]);

  const select = (suggestion: LocationSuggestion) => {
    skipNextSearch.current = true;
    latestRequest.current++;
    setSuggestions([]);
    onChangeText(
      suggestion.subtitle ? `${suggestion.title}, ${suggestion.subtitle}` : suggestion.title,
    );
  };

  return (
    <View>
      <PRISMInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setSuggestions([]);
          onBlur?.();
        }}
        autoCorrect={false}
      />
      {focused && suggestions.length > 0 ? (
        <View
          style={[
            styles.list,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border.default,
            },
          ]}
        >
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.title}-${suggestion.subtitle}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${suggestion.title}, ${suggestion.subtitle}`}
              onPress={() => select(suggestion)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <MapPin size={18} color={theme.accent} />
              <View style={styles.rowText}>
                <Text
                  style={[styles.title, { color: theme.colors.text.primary }]}
                  numberOfLines={1}
                >
                  {suggestion.title}
                </Text>
                {suggestion.subtitle ? (
                  <Text
                    style={[styles.subtitle, { color: theme.colors.text.tertiary }]}
                    numberOfLines={1}
                  >
                    {suggestion.subtitle}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  rowText: {
    flex: 1,
  },
  title: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  subtitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
