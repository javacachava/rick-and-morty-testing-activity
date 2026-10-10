import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CharacterPage from './page';
import { getCharacter, getEpisodes } from '@/lib/api';
import { makeCharacter, makeEpisode } from '@/test/fixtures';

vi.mock('@/lib/api', () => ({
  getCharacter: vi.fn(),
  getEpisodes: vi.fn(),
}));

const mockedGetCharacter = vi.mocked(getCharacter);
const mockedGetEpisodes = vi.mocked(getEpisodes);

async function renderPage(id = '1') {
  render(await CharacterPage({ params: Promise.resolve({ id }) }));
}

describe('Character detail page', () => {
  beforeEach(() => {
    mockedGetCharacter.mockResolvedValue(makeCharacter());
    mockedGetEpisodes.mockResolvedValue([
      makeEpisode({ id: 1, episode: 'S01E01' }),
      makeEpisode({ id: 2, episode: 'S01E02', name: 'Lawnmower Dog' }),
    ]);
  });

  it('fetches the character by id and its episodes by trailing url id', async () => {
    await renderPage('1');

    expect(mockedGetCharacter).toHaveBeenCalledWith('1');
    expect(mockedGetEpisodes).toHaveBeenCalledWith(['1', '2']);
  });

  it('renders the character details', async () => {
    await renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Rick Sanchez' })).toBeInTheDocument();
    expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Earth (C-137)')).toBeInTheDocument();
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Rick Sanchez' })).toBeInTheDocument();
  });

  it('formats the creation date in long en-US form', async () => {
    mockedGetCharacter.mockResolvedValue(makeCharacter({ created: '2017-11-04T12:00:00.000Z' }));

    await renderPage();

    expect(screen.getByText('November 4, 2017')).toBeInTheDocument();
  });

  it('links back to the characters list', async () => {
    await renderPage();

    expect(screen.getByRole('link', { name: /back to characters/i })).toHaveAttribute('href', '/');
  });

  it('lists episodes with count and tooltip', async () => {
    await renderPage();

    expect(screen.getByRole('heading', { name: 'Episodes (2)' })).toBeInTheDocument();
    expect(screen.getByText('S01E01')).toBeInTheDocument();
    expect(screen.getByText('S01E02')).toHaveAttribute('title', 'Lawnmower Dog - December 2, 2013');
  });

  it('shows "Unknown" when the character has no type', async () => {
    await renderPage();

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('shows the character type when present', async () => {
    mockedGetCharacter.mockResolvedValue(makeCharacter({ type: 'Genetic experiment' }));

    await renderPage();

    expect(screen.getByText('Genetic experiment')).toBeInTheDocument();
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
  });

  it.each([
    ['Alive', 'bg-green-500'],
    ['Dead', 'bg-red-500'],
    ['unknown', 'bg-gray-500'],
  ] as const)('uses the %s status indicator color %s', async (status, colorClass) => {
    mockedGetCharacter.mockResolvedValue(makeCharacter({ status }));

    await renderPage();

    const indicator = screen.getByText(new RegExp(`^${status} - `)).previousElementSibling;
    expect(indicator).toHaveClass(colorClass);
  });

  it('renders an empty episode list when the character has no episodes', async () => {
    mockedGetCharacter.mockResolvedValue(makeCharacter({ episode: [] }));
    mockedGetEpisodes.mockResolvedValue([]);

    await renderPage();

    expect(mockedGetEpisodes).toHaveBeenCalledWith([]);
    expect(screen.getByRole('heading', { name: 'Episodes (0)' })).toBeInTheDocument();
  });

  it('propagates API errors so the error boundary can handle them', async () => {
    mockedGetCharacter.mockRejectedValue(new Error('Failed to fetch character details'));

    await expect(renderPage('0')).rejects.toThrow('Failed to fetch character details');
  });
});
