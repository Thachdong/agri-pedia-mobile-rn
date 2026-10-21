import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatRoomItem, formatReportMessage, useChatRooms, useSendMessage, type TChatRoom } from '@/features/chat';
import { useCrops, type TDiagnosis } from '@/features/diagnosis';
import type { TNearbyDistributor } from '@/features/distributor';
import { Button } from '@/shared/components/atoms';
import { ConfirmSheet } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { AppSheet, useAppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { RECIPIENT_FALLBACK_NAME, SEND_REPORT_FAILED } from '../constants/diagnosis-share.constants';
import { FindSupplierSheet } from './find-supplier-sheet';

/** Recipient waiting for confirmation: an existing room or a new distributor (the server finds / creates the room). */
type TRecipient = { target: { roomId: string } | { receiverId: string }; name: string };

export type TSendReportSheetProps = {
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  /** COMPLETED diagnosis of the logged-in FARMER. */
  diagnosis: Pick<TDiagnosis, 'id' | 'cropType' | 'createdAt'>;
  currentUserId: string;
};

/**
 * Send the diagnosis report (Specs/19102026 farmer.md): pick a conversation with a distributor, or "Tìm nhà cung cấp"
 * → confirm → DIAGNOSIS_REPORT message → toast, open that conversation.
 */
export function SendReportSheet({ sheetRef, onClose, diagnosis, currentUserId }: TSendReportSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const rooms = useChatRooms();
  const crops = useCrops();
  const send = useSendMessage(currentUserId);
  const findSheet = useAppSheet();
  const confirmSheet = useAppSheet();
  const [findActive, setFindActive] = useState(false);
  const [recipient, setRecipient] = useState<TRecipient | null>(null);
  const [sendError, setSendError] = useState<string>();

  const cropName = crops.data?.find((crop) => crop.code === diagnosis.cropType)?.nameVi ?? diagnosis.cropType;

  const choose = (next: TRecipient) => {
    setSendError(undefined);
    setRecipient(next);
    confirmSheet.open();
  };

  const chooseRoom = (room: TChatRoom) =>
    choose({ target: { roomId: room.roomId }, name: room.otherUsername ?? RECIPIENT_FALLBACK_NAME });

  const chooseSupplier = (distributor: TNearbyDistributor) => {
    findSheet.close();
    choose({ target: { receiverId: distributor.userId }, name: distributor.username });
  };

  const openFind = () => {
    setFindActive(true);
    findSheet.open();
  };

  const confirmSend = async () => {
    if (!recipient) return;
    try {
      const ack = await send.mutateAsync({
        ...recipient.target,
        message: formatReportMessage(cropName, diagnosis.createdAt),
        type: 'DIAGNOSIS_REPORT',
        diagnosisId: diagnosis.id,
      });
      confirmSheet.close();
      onClose();
      toast.success(`Đã gửi báo cáo cho ${recipient.name}`);
      router.push(ROUTES.chatRoom(ack.roomId));
    } catch (error) {
      setSendError(isAppError(error) ? getErrorMessage(error) : SEND_REPORT_FAILED);
    }
  };

  return (
    <>
      <AppSheet sheetRef={sheetRef} scrollable snapPoints={['70%']} accessibilityLabel="Gửi báo cáo chẩn đoán">
        <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
          <View className="gap-1">
            <Text accessibilityRole="header" className={TEXT.titleMedium}>
              Gửi báo cáo chẩn đoán
            </Text>
            <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>
              Chọn cuộc trò chuyện với nhà cung cấp để gửi báo cáo.
            </Text>
          </View>
          <RoomList rooms={rooms} currentUserId={currentUserId} onSelect={chooseRoom} />
          <Button label="Tìm nhà cung cấp" variant="outline" onPress={openFind} />
        </View>
      </AppSheet>

      <FindSupplierSheet
        sheetRef={findSheet.ref}
        active={findActive}
        onClose={() => setFindActive(false)}
        onChoose={chooseSupplier}
      />

      <ConfirmSheet
        sheetRef={confirmSheet.ref}
        onClose={confirmSheet.close}
        title="Gửi báo cáo chẩn đoán?"
        description={recipient ? `Báo cáo chẩn đoán ${cropName} sẽ được gửi cho ${recipient.name} qua tin nhắn.` : undefined}
        confirmLabel="Gửi báo cáo"
        tone="normal"
        onConfirm={() => void confirmSend()}
        loading={send.isPending}
        error={sendError}
        onDismiss={() => setRecipient(null)}
      />
    </>
  );
}

type TRoomListProps = {
  rooms: ReturnType<typeof useChatRooms>;
  currentUserId: string;
  onSelect: (room: TChatRoom) => void;
};

function RoomList({ rooms, currentUserId, onSelect }: TRoomListProps) {
  const { data } = rooms;

  if (rooms.isPending) {
    return (
      <View className="items-center py-6" accessibilityLabel="Đang tải cuộc trò chuyện">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!data) {
    return (
      <View accessibilityRole="alert" className="items-center gap-2 py-6">
        <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>Không tải được danh sách tin nhắn.</Text>
        <Button label="Thử lại" variant="outline" size="sm" onPress={() => void rooms.refetch()} />
      </View>
    );
  }
  if (data.rooms.length === 0) {
    return (
      <Text className={cn(TEXT.bodyMedium, 'py-6 text-center text-muted-foreground')}>
        Bạn chưa trò chuyện với nhà cung cấp nào. Hãy tìm nhà cung cấp để gửi báo cáo.
      </Text>
    );
  }
  return (
    <View accessibilityLabel="Cuộc trò chuyện" className="gap-1">
      {data.rooms.map((room) => (
        <ChatRoomItem key={room.roomId} room={room} currentUserId={currentUserId} onPress={onSelect} />
      ))}
      {rooms.hasNextPage && (
        <Button
          label={rooms.isFetchNextPageError ? 'Tải thêm thất bại — thử lại' : 'Xem thêm'}
          variant="ghost"
          size="sm"
          loading={rooms.isFetchingNextPage}
          onPress={() => void rooms.fetchNextPage()}
        />
      )}
    </View>
  );
}
