import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { InfoTable } from './info-table';

describe('InfoTable', () => {
  it('renders each label with its value; empty values show the fallback text', async () => {
    await render(
      <InfoTable
        items={[
          { label: 'Email / Phone', value: 'a@b.vn' },
          { label: 'Giấy phép kinh doanh', value: null },
          { label: 'Địa chỉ', value: '' },
          { label: 'Giới thiệu', value: <Text>Cửa hàng giống</Text> },
        ]}
      />,
    );
    expect(screen.getByText('Email / Phone')).toBeOnTheScreen();
    expect(screen.getByText('a@b.vn')).toBeOnTheScreen();
    expect(screen.getAllByText('Chưa cập nhật')).toHaveLength(2);
    expect(screen.getByText('Cửa hàng giống')).toBeOnTheScreen();
  });

  it('custom emptyText', async () => {
    await render(<InfoTable items={[{ label: 'Địa chỉ' }]} emptyText="—" />);
    expect(screen.getByText('—')).toBeOnTheScreen();
  });
});
