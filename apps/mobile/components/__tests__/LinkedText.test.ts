import { linkParts, mapsUrl } from '../LinkedText';

const links = (text: string) =>
  linkParts(text)
    .filter((p) => p.url)
    .map((p) => [p.text, p.url]);

describe('linkParts', () => {
  it('finds web addresses, with or without https', () => {
    expect(links('Join at https://zoom.us/j/123456789, or www.clinic.org.')).toEqual([
      ['https://zoom.us/j/123456789', 'https://zoom.us/j/123456789'],
      ['www.clinic.org', 'https://www.clinic.org'],
    ]);
  });

  it('finds emails and phone numbers', () => {
    expect(links('Call (213) 555-0142 or email front@clinic.org')).toEqual([
      ['(213) 555-0142', 'tel:2135550142'],
      ['front@clinic.org', 'mailto:front@clinic.org'],
    ]);
    expect(links('+1 213 555 0142')).toEqual([['+1 213 555 0142', 'tel:+12135550142']]);
  });

  it('leaves dates, short numbers and plain text alone', () => {
    expect(links('Labs on 2026-10-12, suite 4, dose 0.25 mL')).toEqual([]);
    expect(links('Riverside Health')).toEqual([]);
  });

  it('keeps every piece of the text, in order', () => {
    const text = 'Bring ID. Portal: https://portal.example.com/login then call 555-123-4567.';
    expect(
      linkParts(text)
        .map((p) => p.text)
        .join(''),
    ).toBe(text);
  });
});

describe('mapsUrl', () => {
  it('searches Apple Maps for the place', () => {
    expect(mapsUrl('Riverside Health, Suite 4')).toBe(
      'https://maps.apple.com/?q=Riverside%20Health%2C%20Suite%204',
    );
  });
});
