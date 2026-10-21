import { fireEvent, render, screen } from '@testing-library/react-native';
import { MediaGallery } from './media-gallery';

const layout = { nativeEvent: { layout: { width: 300, height: 225, x: 0, y: 0 } } };
const items = [
  { key: 'm1', uri: 'https://x/1.jpg' },
  { key: 'm2', uri: 'https://x/2.jpg' },
];

describe('MediaGallery', () => {
  it('no image → placeholder', async () => {
    await render(<MediaGallery items={[]} accessibilityLabel="Ảnh" />);
    expect(screen.getByText('Chưa có ảnh')).toBeOnTheScreen();
  });

  it('images labelled with their position + counter', async () => {
    const { root } = await render(<MediaGallery items={items} accessibilityLabel="Ảnh Lúa" />);
    if (!root) throw new Error('not rendered');
    await fireEvent(root, 'layout', layout);
    expect(screen.getByLabelText('Ảnh Lúa 1 / 2')).toBeOnTheScreen();
    expect(screen.getByText('1 / 2')).toBeOnTheScreen();
  });
});
