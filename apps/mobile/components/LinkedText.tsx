import React from 'react';
import { Linking, Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '@prism/ui';

/**
 * Text where web addresses, email addresses and phone numbers can be tapped:
 * a telehealth link in an appointment's notes opens it, a clinic's number
 * calls it. Everything else is plain text.
 */

export interface LinkPart {
  text: string;
  /** Where tapping it goes; absent for plain text. */
  url?: string;
}

const PATTERN =
  /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])|(www\.[^\s<>()]+[^\s<>().,;:!?'"])|([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})|(\+?\(?\d[\d\s().-]{6,}\d)/gi;

/** Splits text into plain parts and tappable links. */
export function linkParts(text: string): LinkPart[] {
  const parts: LinkPart[] = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    const [whole, http, www, email, phone] = match;
    const start = match.index ?? 0;
    let url: string | undefined;
    if (http) url = http;
    else if (www) url = `https://${www}`;
    else if (email) url = `mailto:${email}`;
    else if (phone) {
      const digits = phone.replace(/[^\d+]/g, '');
      const count = digits.replace('+', '').length;
      // Only things that look like a phone number, not a date or an amount.
      const isDate = /^\d{4}[-.]\d{1,2}[-.]\d{1,2}$|^\d{1,2}[-.]\d{1,2}[-.]\d{2,4}$/.test(
        phone.trim(),
      );
      if (!isDate && count >= 7 && count <= 15) {
        url = `tel:${digits}`;
      }
    }
    if (!url) continue;
    if (start > last) parts.push({ text: text.slice(last, start) });
    parts.push({ text: whole, url });
    last = start + whole.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function LinkedText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  return (
    <Text style={style}>
      {linkParts(text).map((part, index) =>
        part.url ? (
          <Text
            key={index}
            accessibilityRole="link"
            onPress={() => Linking.openURL(part.url!).catch(() => undefined)}
            style={{ color: theme.accentText, textDecorationLine: 'underline' }}
          >
            {part.text}
          </Text>
        ) : (
          <Text key={index}>{part.text}</Text>
        ),
      )}
    </Text>
  );
}

/** A Maps search for an address or place name (opens Apple Maps on iPhone). */
export function mapsUrl(place: string): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(place)}`;
}
