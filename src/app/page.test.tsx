import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';
import { getCharacters } from '@/lib/api';
import { makeCharacter, makeCharacterResponse } from '@/test/fixtures';

vi.mock('@/lib/api', () => ({
  getCharacters: vi.fn(),
}));

const mockedGetCharacters = vi.mocked(getCharacters);

async function renderHome(searchParams: { [key: string]: string | string[] | undefined } = {}) {
  render(await Home({ searchParams: Promise.resolve(searchParams) }));
}

describe('Home page', () => {
  beforeEach(() => {
    mockedGetCharacters.mockResolvedValue(
      makeCharacterResponse(
        [makeCharacter({ id: 1, name: 'Rick Sanchez' }), makeCharacter({ id: 2, name: 'Morty Smith' })],
        42,
      ),
    );
  });

  it('fetches page 1 when no page param is given', async () => {
    await renderHome();

    expect(mockedGetCharacters).toHaveBeenCalledWith(1);
    expect(screen.getByText('Page 1 of 42')).toBeInTheDocument();
  });

  it('fetches the page given in the query string', async () => {
    await renderHome({ page: '5' });

    expect(mockedGetCharacters).toHaveBeenCalledWith(5);
    expect(screen.getByText('Page 5 of 42')).toBeInTheDocument();
  });

  it('falls back to page 1 when the page param is not a single string', async () => {
    await renderHome({ page: ['2', '3'] });

    expect(mockedGetCharacters).toHaveBeenCalledWith(1);
  });

  it('renders the title and one card per character', async () => {
    await renderHome();

    expect(screen.getByRole('heading', { level: 1, name: 'Rick and Morty Characters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Morty Smith' })).toBeInTheDocument();
  });

  it('propagates API errors so the error boundary can handle them', async () => {
    mockedGetCharacters.mockRejectedValue(new Error('Failed to fetch characters'));

    await expect(renderHome()).rejects.toThrow('Failed to fetch characters');
  });
});
