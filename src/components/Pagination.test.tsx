import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('shows the current page and total pages', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });

  it('renders both links in the middle of the range', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/?page=2');
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/?page=4');
  });

  it('disables Previous on the first page', () => {
    render(<Pagination currentPage={1} totalPages={10} />);

    expect(screen.queryByRole('link', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.getByText(/previous/i)).toHaveClass('cursor-not-allowed');
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/?page=2');
  });

  it('disables Next on the last page', () => {
    render(<Pagination currentPage={10} totalPages={10} />);

    expect(screen.queryByRole('link', { name: /next/i })).not.toBeInTheDocument();
    expect(screen.getByText(/next/i)).toHaveClass('cursor-not-allowed');
    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/?page=9');
  });

  it('disables both controls when there is a single page', () => {
    render(<Pagination currentPage={1} totalPages={1} />);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
