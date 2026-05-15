import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('@dicebear/core', () => ({
  createAvatar: () => ({
    toString: () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
  }),
}));

jest.mock('@dicebear/collection', () => ({
  openPeeps: {},
  adventurer: {},
  avataaars: {},
  bigEars: {},
  bigSmile: {},
  bottts: {},
  croodles: {},
  funEmoji: {},
  lorelei: {},
  loreleiNeutral: {},
  micah: {},
  miniavs: {},
  notionists: {},
  personas: {},
}));

test('renders Skribblei home screen', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Skribblei/i)).toBeInTheDocument();
});
