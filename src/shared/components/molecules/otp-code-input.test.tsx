import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { OtpCodeInput } from './otp-code-input';

function Harness({ onComplete, error }: { onComplete?: (code: string) => void; error?: string }) {
  const [code, setCode] = useState('');
  return <OtpCodeInput label="Code" value={code} onChangeText={setCode} onComplete={onComplete} error={error} />;
}

const boxText = () => screen.getAllByText(/^\d$/).map((node) => node.props.children as string);

describe('OtpCodeInput', () => {
  it('typing fills the boxes one by one', async () => {
    await render(<Harness />);
    await fireEvent.changeText(screen.getByLabelText('Code'), '12');
    expect(boxText()).toEqual(['1', '2']);

    await fireEvent.changeText(screen.getByLabelText('Code'), '123');
    expect(boxText()).toEqual(['1', '2', '3']);
  });

  it('backspace removes the last digit', async () => {
    await render(<Harness />);
    await fireEvent.changeText(screen.getByLabelText('Code'), '123');
    await fireEvent.changeText(screen.getByLabelText('Code'), '12');
    expect(boxText()).toEqual(['1', '2']);
  });

  it('paste / autofill: keeps digits only, cut at length, fires onComplete once', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);

    await fireEvent.changeText(screen.getByLabelText('Code'), 'Mã: 12-34 5678');

    expect(screen.getByLabelText('Code')).toHaveDisplayValue('123456');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('no onComplete while incomplete', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByLabelText('Code'), '12345');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('shows the error under the boxes', async () => {
    await render(<Harness error="Mã kích hoạt không đúng" />);
    expect(screen.getByText('Mã kích hoạt không đúng')).toBeTruthy();
  });

  it('number pad + one-time-code autofill', async () => {
    await render(<Harness />);
    expect(screen.getByLabelText('Code').props).toMatchObject({
      keyboardType: 'number-pad',
      textContentType: 'oneTimeCode',
      autoComplete: 'sms-otp',
      maxLength: 6,
    });
  });
});
