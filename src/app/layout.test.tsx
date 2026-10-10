import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RootLayout, { metadata } from './layout';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans-var' }),
  Geist_Mono: () => ({ variable: 'geist-mono-var' }),
}));

function renderLayout() {
  return renderToStaticMarkup(
    <RootLayout>
      <p>page content</p>
    </RootLayout>,
  );
}

describe('RootLayout', () => {
  it('exposes the site metadata', () => {
    expect(metadata.title).toBe('Rick and Morty Explorer');
    expect(metadata.description).toBe('Explore the Rick and Morty universe');
  });

  it('renders children inside the main area', () => {
    expect(renderLayout()).toContain('<p>page content</p>');
  });

  it('renders the header navigation links', () => {
    const html = renderLayout();

    expect(html).toContain('Rick &amp; Morty App');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="https://rickandmortyapi.com/documentation"');
  });

  it('opens external links safely', () => {
    const html = renderLayout();

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('applies the font variables and sets the document language', () => {
    const html = renderLayout();

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('geist-sans-var');
    expect(html).toContain('geist-mono-var');
  });

  it('renders the footer with API attribution', () => {
    expect(renderLayout()).toContain('The Rick and Morty API');
  });
});
