import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App bootstrap', () => {
  it('renders the bootstrap heading', () => {
    render(<App />);
    expect(screen.getByText(/Bootstrap OK/i)).toBeInTheDocument();
  });
});
