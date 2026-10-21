import { useMemo } from 'react';
import { CROP_STAGE_LABELS, PLANT_PART_LABELS } from '../constants/diagnosis.constants';
import type { TPlantPart } from '../types/diagnosis.types';
import type { TCropStage } from '../types/knowledge.types';
import { useCrops } from './use-crops';

export type TCropLabels = {
  partLabel: (code: TPlantPart) => string;
  stageLabel: (code: TCropStage) => string;
};

/**
 * Plant part / stage labels of a crop (GET /knowledge/crops) — one code may read differently per crop (SEEDLING: rice
 * "Mạ", durian "Cây con / vườn ươm"). Crop unknown / not loaded yet → generic labels.
 */
export function useCropLabels(cropType?: string): TCropLabels {
  const { data: crops } = useCrops();
  const crop = cropType ? crops?.find((item) => item.code === cropType) : undefined;

  return useMemo(() => {
    const parts = new Map(crop?.plantParts.map((part) => [part.code, part.nameVi]));
    const stages = new Map(crop?.cropStages.map((stage) => [stage.code, stage.nameVi]));
    return {
      partLabel: (code) => parts.get(code) ?? PLANT_PART_LABELS[code],
      stageLabel: (code) => stages.get(code) ?? CROP_STAGE_LABELS[code],
    };
  }, [crop]);
}
