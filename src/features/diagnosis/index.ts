// Public API of the `diagnosis` feature. Other features and src/app import only this file.
export { HomeDiagnosisPanel, type THomeDiagnosisPanelProps } from './components/home-diagnosis-panel';
export { diagnosisSettingsQuery } from './hooks/diagnosis.queries';
export { cropsQuery } from './hooks/knowledge.queries';
export { useCreateDiagnosis } from './hooks/use-create-diagnosis';
export { useCrops } from './hooks/use-crops';
export { useDiagnosisSettings } from './hooks/use-diagnosis-settings';
export type { TCreateDiagnosisInput, TDiagnosisSettings, TPlantPart } from './types/diagnosis.types';
export type { TCrop, TCropPlantPart } from './types/knowledge.types';
