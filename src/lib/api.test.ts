import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCharacter, getCharacters, getEpisodes } from './api';
import { makeCharacter, makeCharacterResponse, makeEpisode } from '@/test/fixtures';

const BASE = 'https://rickandmortyapi.com/api';

function mockFetch(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('api', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getCharacters', () => {
    it('requests page 1 by default and returns parsed response', async () => {
      const data = makeCharacterResponse();
      const fetchMock = mockFetch(data);

      await expect(getCharacters()).resolves.toEqual(data);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/character?page=1`);
    });

    it('requests the given page', async () => {
      const fetchMock = mockFetch(makeCharacterResponse());

      await getCharacters(7);

      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/character?page=7`);
    });

    it('throws when the response is not ok', async () => {
      mockFetch({}, false);

      await expect(getCharacters()).rejects.toThrow('Failed to fetch characters');
    });
  });

  describe('getCharacter', () => {
    it('requests the character by id and returns it', async () => {
      const character = makeCharacter({ id: 5, name: 'Jerry Smith' });
      const fetchMock = mockFetch(character);

      await expect(getCharacter('5')).resolves.toEqual(character);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/character/5`);
    });

    it('throws when the response is not ok', async () => {
      mockFetch({}, false);

      await expect(getCharacter('999999')).rejects.toThrow('Failed to fetch character details');
    });
  });

  describe('getEpisodes', () => {
    it('returns an empty array without calling fetch when no ids are given', async () => {
      const fetchMock = mockFetch([]);

      await expect(getEpisodes([])).resolves.toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('joins ids with commas and returns the array as-is', async () => {
      const episodes = [makeEpisode({ id: 1 }), makeEpisode({ id: 2, episode: 'S01E02' })];
      const fetchMock = mockFetch(episodes);

      await expect(getEpisodes(['1', '2'])).resolves.toEqual(episodes);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/episode/1,2`);
    });

    it('wraps a single episode object in an array', async () => {
      const episode = makeEpisode();
      mockFetch(episode);

      await expect(getEpisodes(['1'])).resolves.toEqual([episode]);
    });

    it('throws when the response is not ok', async () => {
      mockFetch({}, false);

      await expect(getEpisodes(['1'])).rejects.toThrow('Failed to fetch episodes');
    });
  });
});
