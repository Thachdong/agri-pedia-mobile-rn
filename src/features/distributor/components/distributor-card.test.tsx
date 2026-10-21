import { fireEvent, render, screen } from '@testing-library/react-native';
import { nearbyDistributor } from '../test/distributor.fixtures';
import { DistributorCard } from './distributor-card';

describe('DistributorCard', () => {
  it('shows username, business type, province and distance; press passes the distributor', async () => {
    const onPress = jest.fn();
    const distributor = nearbyDistributor();
    await render(<DistributorCard distributor={distributor} provinceName="Hà Nội" onPress={onPress} />);
    expect(screen.getByText('Đại lý Minh Phát')).toBeOnTheScreen();
    expect(screen.getByText('Giống cây trồng')).toBeOnTheScreen();
    expect(screen.getByText('Hà Nội · 1,2 km')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(distributor);
  });

  it('area scope (no distance) and province not resolved yet → no empty line', async () => {
    await render(
      <DistributorCard
        distributor={nearbyDistributor({ distanceMeters: null, bussinessType: null })}
        provinceName={null}
        onPress={jest.fn()}
      />,
    );
    expect(screen.queryByText(/km|·/)).toBeNull();
    expect(screen.queryByText('Giống cây trồng')).toBeNull();
  });

  it('selected → accessibility state selected', async () => {
    await render(<DistributorCard distributor={nearbyDistributor()} provinceName="Hà Nội" selected onPress={jest.fn()} />);
    expect(screen.getByRole('button')).toBeSelected();
  });
});
