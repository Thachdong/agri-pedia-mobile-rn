import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button } from '@/shared/components/atoms';
import { InfoTable } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { getErrorMessage } from '@/shared/lib/http';
import { AppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { AGENT_TYPE_LABELS, CATEGORY_LABELS } from '../constants/diagnosis.constants';
import { useCropLabels } from '../hooks/use-crop-labels';
import { useDisease } from '../hooks/use-disease';
import type { TDisease } from '../types/knowledge.types';
import { articlePathParts } from '../utils/diagnosis-view.util';

export type TDiseaseSheetProps = {
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  /** Disease shown; null = nothing loaded. */
  code: string | null;
  /** Crop of the diagnosis — crop-specific part / stage labels. */
  cropType?: string;
};

/** Full information of one disease (GET /knowledge/diseases/{code}) — opened from a disease name on the result screen. */
export function DiseaseSheet({ sheetRef, onClose, code, cropType }: TDiseaseSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <AppSheet sheetRef={sheetRef} scrollable snapPoints={['90%']} accessibilityLabel="Thông tin bệnh" onDismiss={onClose}>
      <View style={{ paddingBottom: insets.bottom + 16 }} className="px-4 pt-2">
        {code && <DiseaseReport code={code} cropType={cropType} onNavigate={onClose} />}
      </View>
    </AppSheet>
  );
}

function DiseaseReport({ code, cropType, onNavigate }: { code: string; cropType?: string; onNavigate: () => void }) {
  const query = useDisease(code);
  if (query.isPending) {
    return (
      <View className="items-center py-10" accessibilityLabel="Đang tải thông tin bệnh">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (query.isError) {
    return (
      <View accessibilityRole="alert" className="gap-3 py-6">
        <Text className={TEXT.titleMedium}>Không tải được thông tin bệnh</Text>
        <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{getErrorMessage(query.error)}</Text>
        <Button label="Thử lại" variant="outline" size="sm" onPress={() => void query.refetch()} />
      </View>
    );
  }
  return <DiseaseArticle disease={query.data} cropType={cropType} onNavigate={onNavigate} />;
}

type TDiseaseArticleProps = { disease: TDisease; cropType?: string; onNavigate: () => void };

/** Same sections as the web disease dialog; links to articles open the app's article screen. */
function DiseaseArticle({ disease, cropType, onNavigate }: TDiseaseArticleProps) {
  const router = useRouter();
  const { partLabel, stageLabel } = useCropLabels(cropType);
  const { cultural, biological, nutrition } = disease.treatments;
  const subtitle = [disease.nameEn, disease.scientificName].filter(Boolean).join(' · ');

  const openArticle = (path: string) => {
    const parts = articlePathParts(path);
    if (!parts) return;
    onNavigate();
    router.push(ROUTES.articles.detail(parts.cropSlug, parts.slug));
  };

  return (
    <View className="gap-6">
      <View className="gap-3">
        {disease.verification !== 'SOURCED' && (
          <View className="rounded-lg bg-warning-subtle px-3 py-2">
            <Text className={cn(TEXT.bodyMedium, 'text-warning')}>Thông tin chưa được chuyên gia xác nhận.</Text>
          </View>
        )}
        <View className="gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text accessibilityRole="header" className={TEXT.titleLarge}>
              {disease.nameVi}
            </Text>
            <Badge label={CATEGORY_LABELS[disease.category]} />
          </View>
          {subtitle !== '' && <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{subtitle}</Text>}
        </View>
        {disease.article && (
          <Button
            label="Đọc bài viết đầy đủ"
            variant="outline"
            size="sm"
            onPress={() => disease.article && openArticle(disease.article.path)}
            className="self-start"
          />
        )}
        <InfoTable
          items={[
            { label: 'Tên khác', value: disease.aliases.join(', ') },
            { label: 'Tác nhân', value: AGENT_TYPE_LABELS[disease.agentType] },
            { label: 'Bộ phận bị hại', value: disease.affectedParts.map(partLabel).join(', ') },
            { label: 'Giai đoạn', value: disease.cropStages.map(stageLabel).join(', ') },
          ]}
        />
      </View>

      <ListSection title="Tác nhân gây bệnh" items={disease.pathogens} />
      <ListSection title="Triệu chứng" items={disease.symptoms} />
      {disease.variants.length > 0 && (
        <Section title="Các dạng bệnh">
          {disease.variants.map((variant) => (
            <View key={variant.code} className="gap-1 rounded-lg border border-border-subtle p-3">
              <Text className={TEXT.titleSmall}>{variant.name}</Text>
              {variant.affectedParts !== '' && (
                <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>Bộ phận: {variant.affectedParts}</Text>
              )}
              <Bullets items={variant.symptoms} />
            </View>
          ))}
        </Section>
      )}
      {disease.transmissionMode && (
        <Section title="Cách lây lan">
          <Text className={TEXT.bodyMedium}>{disease.transmissionMode}</Text>
        </Section>
      )}
      <ListSection title="Điều kiện phát sinh" items={disease.favorableConditions} />
      {cultural.length + biological.length + nutrition.length > 0 && (
        <Section title="Biện pháp phòng trừ">
          <SubList title="Canh tác" items={cultural} />
          <SubList title="Sinh học" items={biological} />
          <SubList title="Dinh dưỡng" items={nutrition} />
        </Section>
      )}
      {disease.similarDiseases.length > 0 && (
        <Section title="Bệnh dễ nhầm">
          {disease.similarDiseases.map((similar) => (
            <View key={similar.code} className="gap-0.5">
              {similar.article ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => similar.article && openArticle(similar.article.path)}
                  className="self-start active:opacity-70"
                >
                  <Text className={cn(TEXT.labelLarge, 'text-highlight underline')}>{similar.name}</Text>
                </Pressable>
              ) : (
                <Text className={TEXT.labelLarge}>{similar.name}</Text>
              )}
              {similar.distinguishingFeature && (
                <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>Phân biệt: {similar.distinguishingFeature}</Text>
              )}
            </View>
          ))}
        </Section>
      )}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className={TEXT.titleMedium}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return items.map((item) => (
    <Text key={item} className={TEXT.bodyMedium}>
      • {item}
    </Text>
  ));
}

/** List section — empty → hidden. */
function ListSection({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <Section title={title}>
      <Bullets items={items} />
    </Section>
  );
}

function SubList({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <View className="gap-1">
      <Text className={TEXT.labelLarge}>{title}</Text>
      <Bullets items={items} />
    </View>
  );
}
