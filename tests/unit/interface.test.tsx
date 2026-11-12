import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Provider, useUniverse } from '@/components/provider';
import { Settings } from '@/components/settings';
import { Confirm } from '@/components/dialog';
import { Navigation } from '@/components/navigation';
import { KEY } from '@/lib/storage';
vi.mock('next/navigation', () => ({ usePathname: () => '/universe' }));
function Status() {
  const { state } = useUniverse();
  return <output data-testid="state">{JSON.stringify(state)}</output>;
}
it('hydrates settings safely, updates preferences and persists changes', async () => {
  render(
    <Provider>
      <Settings onClose={() => {}} />
      <Status />
    </Provider>,
  );
  fireEvent.change(screen.getByLabelText('Motion'), { target: { value: 'reduced' } });
  fireEvent.click(screen.getByLabelText('Higher contrast'));
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem(KEY)!).preferences.motion).toBe('reduced'),
  );
  expect(screen.getByTestId('state')).toHaveTextContent('"contrast":true');
});
it('requires explicit confirmation to clear local creations and preferences', async () => {
  render(
    <Provider>
      <Settings onClose={() => {}} />
      <Status />
    </Provider>,
  );
  fireEvent.click(screen.getByLabelText('Higher contrast'));
  fireEvent.click(screen.getByText('Clear all local data'));
  expect(screen.getByText('Clear your local universe?')).toBeVisible();
  fireEvent.click(screen.getByText('Keep it'));
  expect(screen.getByTestId('state')).toHaveTextContent('"contrast":true');
  fireEvent.click(screen.getByText('Clear all local data'));
  fireEvent.click(screen.getByText('Confirm clear'));
  await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('"contrast":false'));
});
it('confirmation does not act until confirmed', () => {
  const confirm = vi.fn(),
    close = vi.fn();
  render(<Confirm title="Reset?" onConfirm={confirm} onClose={close} />);
  expect(confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Confirm clear'));
  expect(confirm).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
});
it('offers real navigation and an expandable mobile menu', () => {
  render(
    <Provider>
      <Navigation />
    </Provider>,
  );
  const button = screen.getByRole('button', { name: 'Menu' });
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'The Universe' })).toHaveAttribute('href', '/universe');
  fireEvent.click(screen.getByRole('link', { name: 'Your Journal' }));
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
});
