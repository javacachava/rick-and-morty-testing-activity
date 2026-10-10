import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Loading from './loading';

describe('app/loading', () => {
  it('renders a title placeholder and 8 card skeletons', () => {
    const { container } = render(<Loading />);

    expect(container.querySelectorAll('.grid > div')).toHaveLength(8);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(8);
  });
});
