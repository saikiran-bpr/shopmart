import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('App Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders ShopSmart title', () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'ok', message: 'Test Msg', timestamp: 'now' })
      })
    );

    render(<App />);
    const linkElement = screen.getByText(/ShopSmart/i);
    expect(linkElement).toBeInTheDocument();
  });

  it('displays loading text initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

    render(<App />);
    const loadingText = screen.getByText(/Loading backend status/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('fetches and displays backend status', async () => {
    const mockData = {
      status: 'ok',
      message: 'ShopSmart Backend is running',
      timestamp: new Date().toISOString()
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData)
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Status:/i)).toBeInTheDocument();
      expect(screen.getByText('ok')).toBeInTheDocument();
      expect(screen.getByText(/ShopSmart Backend is running/)).toBeInTheDocument();
    });
  });

  it('renders Backend Status card', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'ok', message: 'Test', timestamp: 'now' })
      })
    );

    render(<App />);
    const cardHeading = screen.getByRole('heading', { level: 2, name: /Backend Status/i });
    expect(cardHeading).toBeInTheDocument();
  });

  it('calls fetch with correct API endpoint', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'ok', message: 'Test', timestamp: 'now' })
      })
    );

    render(<App />);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/health'));
  });

  it('handles fetch errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<App />);

    setTimeout(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching health check:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    }, 0);
  });
});
