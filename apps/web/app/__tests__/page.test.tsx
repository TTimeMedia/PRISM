import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { APP_TAGLINE } from '@prism/config';
import Home from '../page';

describe('Home (marketing page)', () => {
  it('renders the Prism tagline', () => {
    render(<Home />);
    expect(screen.getByText(APP_TAGLINE)).toBeTruthy();
  });

  it('renders the manifesto without rewriting it into clinical language', () => {
    // See docs/PRODUCT_BIBLE.md §4 and §75 in the source material.
    render(<Home />);
    expect(screen.getByText('Prism adapts to every journey.')).toBeTruthy();
  });
});
