// Public API of the `diagnosis` feature. Other features and src/app import only this file.
export { DiagnosisResult, type TDiagnosisResultProps } from './components/diagnosis-result';
export { HomeDiagnosisPanel, type THomeDiagnosisPanelProps } from './components/home-diagnosis-panel';
export { diagnosisQuery, diagnosisSettingsQuery } from './hooks/diagnosis.queries';
export { cropsQuery, diseaseQuery } from './hooks/knowledge.queries';
export { useCreateDiagnosis } from './hooks/use-create-diagnosis';
export { useCrops } from './hooks/use-crops';
export { useDiagnosisLive } from './hooks/use-diagnosis-live';
export { useDiagnosisSettings } from './hooks/use-diagnosis-settings';
export type { TCreateDiagnosisInput, TDiagnosis, TDiagnosisSettings, TPlantPart } from './types/diagnosis.types';
export type { TCrop, TCropPlantPart, TDisease } from './types/knowledge.types';
