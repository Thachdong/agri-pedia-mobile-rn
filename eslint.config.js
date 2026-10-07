// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const pluginQuery = require('@tanstack/eslint-plugin-query');

// ---------------------------------------------------------------------------
// Architecture rules (skill rn-arch-lint-setup; same structure as ../../client/eslint.config.mjs).
// Keep in sync with ui_ux_rn/CLAUDE.md "Dependency rules".
// `@typescript-eslint/no-restricted-imports` options do NOT merge across config objects —
// every override repeats the full option set it still wants. Later objects win for the same rule.
// ---------------------------------------------------------------------------

/** Packages wrapped in src/shared/lib/<concern> — import the wrapper instead. */
const WRAPPED = [
  { name: '@tanstack/react-query', message: 'Use @/shared/lib/query.' },
  { name: '@react-native-community/netinfo', message: 'Use @/shared/lib/query (online manager).' },
  { name: 'joi', message: 'Use @/shared/lib/validation.' },
  { name: 'react-hook-form', message: 'Use @/shared/lib/form.' },
  { name: '@hookform/resolvers', message: 'Use @/shared/lib/form.' },
  { name: 'socket.io-client', message: 'Use @/shared/lib/realtime.' },
  { name: 'expo-secure-store', message: 'Use @/shared/lib/auth (tokenStore).' },
  { name: '@react-native-async-storage/async-storage', message: 'Use @/shared/lib/storage.' },
  { name: 'expo-location', message: 'Use @/shared/lib/device.' },
  { name: 'expo-image-picker', message: 'Use @/shared/lib/device.' },
  { name: 'react-native-maps', message: 'Use AppMap from @/shared/lib/map.' },
  { name: '@gorhom/bottom-sheet', message: 'Use @/shared/lib/sheet.' },
  { name: 'sonner-native', message: 'Use @/shared/lib/toast.' },
];
const WRAPPED_PATTERNS = [
  { group: ['@hookform/resolvers/*'], message: 'Use @/shared/lib/form.' },
  { group: ['@tanstack/react-query/*'], message: 'Use @/shared/lib/query.' },
];

const DEEP_FEATURE = {
  group: ['@/features/*/*'],
  message: 'Import a feature only through its index: @/features/<slug>.',
};
const SHARED_TO_FEATURE = {
  group: ['@/features/*'],
  message: 'src/shared must not depend on features.',
  allowTypeImports: true,
};

const COLOR_MESSAGE = 'Use theme tokens: semantic classes (bg-primary, text-highlight) or colors.* from @/shared/theme.';
const PALETTE_CLASS =
  /\b(bg|text|border|ring|fill|stroke)-(red|green|blue|gray|slate|zinc|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d/;

const SYNTAX = {
  processEnv: {
    selector: "MemberExpression[object.name='process'][property.name='env']",
    message: 'Read env via @/shared/config.',
  },
  queryKey: {
    selector: "Property[key.name='queryKey'] > ArrayExpression",
    message: 'Use queryKeys.* from @/shared/lib/query.',
  },
  fetch: {
    selector: "CallExpression[callee.name='fetch']",
    message: 'Use http from @/shared/lib/http.',
  },
  hexColor: { selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]', message: COLOR_MESSAGE },
  fnColor: { selector: 'Literal[value=/^(rgb|hsl)a?\\(/]', message: COLOR_MESSAGE },
  paletteClass: { selector: `Literal[value=${PALETTE_CLASS}]`, message: COLOR_MESSAGE },
  paletteClassTpl: { selector: `TemplateElement[value.raw=${PALETTE_CLASS}]`, message: COLOR_MESSAGE },
  arbitraryColor: { selector: 'Literal[value=/-\\[#/]', message: COLOR_MESSAGE },
  arbitraryColorTpl: { selector: 'TemplateElement[value.raw=/-\\[#/]', message: COLOR_MESSAGE },
  fontSize: {
    selector: "Property[key.name='fontSize'] > Literal",
    message: 'Use text classes (text-sm, text-xl) or TEXT roles from @/shared/theme.',
  },
};
const ALL_SYNTAX = Object.values(SYNTAX);
const syntaxExcept = (...keys) => ['error', ...Object.entries(SYNTAX).filter(([k]) => !keys.includes(k)).map(([, v]) => v)];

const restrictImports = (patterns, paths = WRAPPED, basePatterns = WRAPPED_PATTERNS) => [
  'error',
  { paths, patterns: [...basePatterns, ...patterns] },
];

const ATOM_UP = {
  group: [
    '@/shared/components/molecules*',
    '@/shared/components/organisms*',
    '@/shared/components/templates*',
    '../molecules/*',
    '../organisms/*',
    '../templates/*',
  ],
  message: 'Atoms cannot import higher atomic levels.',
};
const MOLECULE_UP = {
  group: ['@/shared/components/organisms*', '@/shared/components/templates*', '../organisms/*', '../templates/*'],
  message: 'Molecules cannot import organisms/templates.',
};
const NO_DATA_HOOKS = {
  group: ['@/shared/lib/query*'],
  message: 'Atoms/molecules take props only — data hooks belong to organisms.',
};

const architectureRules = [
  // 1. Everywhere in src.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': restrictImports([DEEP_FEATURE]),
      'no-restricted-syntax': ['error', ...ALL_SYNTAX],
      'import/no-default-export': 'error',
    },
  },
  // 2. shared never imports features (type-only allowed, e.g. filter types in query-keys).
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/no-restricted-imports': restrictImports([SHARED_TO_FEATURE]) },
  },
  // 3. Exceptions by folder.
  { files: ['src/shared/config/**/*.ts'], rules: { 'no-restricted-syntax': syntaxExcept('processEnv') } },
  {
    files: ['src/shared/theme/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': syntaxExcept('hexColor', 'fnColor', 'paletteClass', 'paletteClassTpl', 'fontSize'),
    },
  },
  { files: ['src/shared/lib/query/**/*.{ts,tsx}'], rules: { 'no-restricted-syntax': syntaxExcept('queryKey') } },
  {
    files: ['src/shared/lib/http/**/*.{ts,tsx}', 'src/shared/lib/auth/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': syntaxExcept('fetch') },
  },
  // 4. Atomic direction.
  {
    files: ['src/shared/components/atoms/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports([SHARED_TO_FEATURE, ATOM_UP, NO_DATA_HOOKS]),
    },
  },
  {
    files: ['src/shared/components/molecules/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports([SHARED_TO_FEATURE, MOLECULE_UP, NO_DATA_HOOKS]),
    },
  },
  // 5. Expo Router route files must default-export the screen.
  { files: ['src/app/**/*.{ts,tsx}'], rules: { 'import/no-default-export': 'off' } },
  // 6. Tests may mock / drive wrapped packages directly.
  {
    files: ['src/test-utils/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: [DEEP_FEATURE] }],
      'no-restricted-syntax': syntaxExcept('queryKey', 'fetch', 'hexColor', 'fnColor'),
    },
  },
  // 7. Wrappers may use the wrapped packages (keep LAST).
  {
    files: ['src/shared/lib/**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/no-restricted-imports': ['error', { patterns: [SHARED_TO_FEATURE] }] },
  },
];

module.exports = defineConfig([
  expoConfig,
  pluginQuery.configs['flat/recommended'],
  ...architectureRules,
  globalIgnores(['dist/*', '.expo/*', 'graphify-out/*', 'src/shared/lib/http/openapi.d.ts']),
]);
