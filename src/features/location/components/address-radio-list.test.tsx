import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AddressRadioList } from './address-radio-list';

jest.mock('../hooks/use-address-label', () => ({
  useAddressLabel: (address: { houseNumber: string } | null) => address?.houseNumber ?? null,
}));

const addresses = [
  { id: 'a1', province: 'p', ward: 'w', houseNumber: '1 Kim Mã' },
  { id: 'a2', province: 'p', ward: 'w', houseNumber: '2 Láng Hạ' },
];

describe('AddressRadioList', () => {
  it('one radio per address, the selected one checked with the "Mặc định" badge', async () => {
    await render(<AddressRadioList addresses={addresses} value="a1" onChange={jest.fn()} />);
    expect(screen.getByRole('radio', { name: '1 Kim Mã. Mặc định' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '2 Láng Hạ' })).not.toBeChecked();
    expect(screen.getAllByText('Mặc định')).toHaveLength(1);
  });

  it('pressing a row → onChange(id); action slot gets (address, checked)', async () => {
    const onChange = jest.fn();
    await render(
      <AddressRadioList
        addresses={addresses}
        value="a1"
        onChange={onChange}
        renderAction={(address, checked) => <Text>{`${address.id}:${checked}`}</Text>}
      />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: '2 Láng Hạ' }));
    expect(onChange).toHaveBeenCalledWith('a2');
    expect(screen.getByText('a1:true')).toBeOnTheScreen();
    expect(screen.getByText('a2:false')).toBeOnTheScreen();
  });

  it('disabled → radios disabled', async () => {
    await render(<AddressRadioList addresses={addresses} value="a1" onChange={jest.fn()} disabled />);
    expect(screen.getByRole('radio', { name: '2 Láng Hạ' })).toBeDisabled();
  });

  it('no address → empty text', async () => {
    await render(<AddressRadioList addresses={[]} value={undefined} onChange={jest.fn()} />);
    expect(screen.getByText('Chưa có địa chỉ')).toBeOnTheScreen();
  });
});
