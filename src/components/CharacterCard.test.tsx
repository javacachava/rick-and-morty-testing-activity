import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CharacterCard from './CharacterCard';
import { makeCharacter } from '@/test/fixtures';

describe('CharacterCard', () => {
  it('links to the character detail page', () => {
    render(<CharacterCard character={makeCharacter({ id: 42 })} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/character/42');
  });

  it('shows name, status, species and last known location', () => {
    render(<CharacterCard character={makeCharacter()} />);

    expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
    expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    expect(screen.getByText('Last known location:')).toBeInTheDocument();
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
  });

  it('renders the character image with the name as alt text', () => {
    render(<CharacterCard character={makeCharacter()} />);

    expect(screen.getByRole('img', { name: 'Rick Sanchez' })).toBeInTheDocument();
  });

  it.each([
    ['Alive', 'bg-green-500'],
    ['Dead', 'bg-red-500'],
    ['unknown', 'bg-gray-500'],
  ] as const)('uses %s status color %s', (status, colorClass) => {
    const { container } = render(<CharacterCard character={makeCharacter({ status })} />);

    expect(container.querySelector('span.rounded-full')).toHaveClass(colorClass);
  });

  it('falls back to gray when the status is not recognised', () => {
    const character = makeCharacter({ status: 'Zombie' as never });
    const { container } = render(<CharacterCard character={character} />);

    expect(container.querySelector('span.rounded-full')).toHaveClass('bg-gray-500');
  });
});
