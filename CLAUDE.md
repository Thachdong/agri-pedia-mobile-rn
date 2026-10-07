# AgriPedia mobile — React Native (`ui_ux_rn/`)

Expo app, same features as the Flutter app (`../ui_ux`) and the web client (`../../client`). Folder layout mirrors the web client (`../../client/src`); architecture rules mirror the Flutter app. Shared rules (specs, API contract lookup, locked decisions, never commit, graphify): `../CLAUDE.md`. Skills `rn-*` (entry `/rn-feature`).

Run every npm/npx command from `ui_ux_rn/` (`cd ui_ux_rn && ...`). Run `.claude/scripts/*` from `mobile/` (the parent).

## Workflow
- Build a page/feature → `/rn-feature` (plan grouped into checkpoints api / logic / ui / screen / test; stop + commit message after each checkpoint). Plans in `mobile/.claude/plans/rn/<slug>.md`.
- Types: `npm run gen:api` (openapi-typescript `../specs/openapi.json` → `src/shared/lib/http/openapi.d.ts`). Never hand-edit; feature types alias `TApiSchema<'Name'>`.
- Checks: `cd ui_ux_rn && npx tsc --noEmit && npx expo lint && npx jest <files>`. Lint encodes the dependency rules below (`rn-arch-lint-setup`).

## Stack
Expo (latest SDK) + Expo Router (file routes in `src/app/`), TypeScript strict, `@/*` → `src/*`. TanStack Query (wrapped), fetch-based http client (wrapped), react-hook-form + joi (wrapped), socket.io-client (wrapped), expo-secure-store + @react-native-async-storage/async-storage (wrapped), expo-location + expo-image-picker (wrapped), react-native-maps + `UrlTile` OSM (wrapped), @gorhom/bottom-sheet (wrapped), sonner-native (wrapped), NativeWind (Tailwind) + `cva` + `cn`, expo-image, jest-expo + @testing-library/react-native.

## Structure
```
ui_ux_rn/
├── CLAUDE.md
├── app.config.ts                    # name, scheme, plugins, typedRoutes
├── package.json                     # scripts: start, lint, test, gen:api
├── tsconfig.json                    # strict, paths @/* → src/*
├── eslint.config.js                 # architecture rules (rn-arch-lint-setup)
├── babel.config.js  metro.config.js # NativeWind wiring
├── tailwind.config.js               # only if NativeWind v4 (v5: @theme in global.css)
├── nativewind-env.d.ts
├── jest.setup.ts
├── .env  .env.example               # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SOCKET_URL, EXPO_PUBLIC_MAP_TILE_URL
├── assets/                          # icon, splash, fonts, images
└── src/
    ├── app/                         # Expo Router routes ONLY — thin screens, default export
    │   ├── _layout.tsx              # AppProviders + root Stack, splash gating
    │   ├── index.tsx                # home "/" (distributor)
    │   ├── auth/                    # login, register, activate, reset-password, change-password
    │   ├── profile/
    │   │   └── [id].tsx
    │   └── (private)/               # guard: guest → /auth/login
    │       ├── _layout.tsx
    │       ├── chat/  notifications/  profile/me ...
    ├── shared/
    │   ├── config/                  # env.ts — only place reading process.env
    │   ├── lib/                     # wrappers, one folder per concern, index.ts = project API
    │   │   ├── http/                # createHttpClient, http, AppError, getErrorMessage, openapi.d.ts, TApiSchema, toCursorPage
    │   │   ├── query/               # QueryClient, queryKeys (central), useAppQuery / useAppInfiniteQuery / useAppMutation
    │   │   ├── auth/                # tokenStore (secure-store), single-flight refresh, session-expired event
    │   │   ├── storage/             # keyValueStorage (async-storage)
    │   │   ├── realtime/            # realtimeClient (socket.io), RealtimeProvider, useRealtimeEvent
    │   │   ├── device/              # getCurrentPosition, pickImages
    │   │   ├── map/                 # AppMap (react-native-maps + UrlTile)
    │   │   ├── sheet/               # AppSheet, useAppSheet (@gorhom/bottom-sheet)
    │   │   ├── toast/               # toast, ToastHost (sonner-native)
    │   │   ├── validation/          # v, schema, rules (joi)
    │   │   ├── form/                # useAppForm, FormField, applyServerErrors (react-hook-form)
    │   │   └── utils.ts             # cn
    │   ├── theme/                   # global.css (tokens), colors.ts (values for non-className props), typography.ts
    │   ├── components/
    │   │   ├── atoms/               # button, text, input, avatar, star-rating ... + index.ts
    │   │   ├── molecules/           # form-input, otp-code-input, countdown-resend ... + index.ts
    │   │   ├── organisms/           # app-header, infinite-list ... + index.ts
    │   │   └── templates/           # auth-layout, map-list-layout, profile-layout + index.ts
    │   ├── hooks/                   # use-countdown.ts ... (UI behaviour only)
    │   ├── utils/                   # format-price.util.ts ...
    │   ├── constants/               # routes.constants.ts ...
    │   ├── types/                   # TUserRole, TLoginType ... (derived from openapi)
    │   └── providers/               # app-providers.tsx
    ├── features/
    │   └── <slug>/                  # kebab-case; slugs: see ../CLAUDE.md "Features"
    │       ├── index.ts             # public API — the only file others import
    │       ├── services/            # <entity>.service.ts (http), <slug>.realtime.ts (socket)
    │       ├── hooks/               # <entity>.queries.ts, use-xxx.ts (query/mutation + feature UI hooks)
    │       ├── schemas/             # <entity>.schema.ts — joi via @/shared/lib/validation
    │       ├── components/          # feature molecules/organisms, <name>-sheet.tsx for modals
    │       ├── types/               # <entity>.types.ts — TApiSchema aliases
    │       ├── utils/               # <name>.util.ts, <name>.store.ts (handoff)
    │       └── constants/           # <name>.constants.ts
    └── test-utils/                  # renderWithProviders, hookWrapper, createTestQueryClient
```
Tests colocated: `<file>.test.ts(x)` next to the unit. `ios/` and `android/` are generated by `npx expo prebuild`, not committed.

## Dependency rules (enforced by `eslint.config.js`)
- `@/...` imports across folders; relative only inside one feature.
- `src/shared` → never `@/features/*` (type-only allowed in `query-keys.ts`). `src/features/<a>` → other features only via `@/features/<b>`. `src/app` → anything public.
- Inside a feature: `components → hooks → services → @/shared/lib/http`; `schemas/types/constants/utils` are leaves.
- Atomic direction: atoms ↛ molecules/organisms/templates; molecules ↛ organisms/templates; only organisms call data hooks or `useAppForm`.
- Wrapped packages only in their folder under `src/shared/lib/<concern>/`: `@tanstack/react-query` + `@react-native-community/netinfo` (query; also `src/test-utils/`), `joi`, `react-hook-form`, `@hookform/resolvers`, `socket.io-client`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-location`, `expo-image-picker`, `react-native-maps`, `@gorhom/bottom-sheet`, `sonner-native`.
- `process.env` only in `src/shared/config/`. `fetch(` only in `src/shared/lib/http/` and `src/shared/lib/auth/`.
- No hex/rgb literals, raw Tailwind palette classes (`bg-green-700`) or arbitrary colors (`bg-[#..]`) outside `src/shared/theme/`. Numeric `fontSize` in `style` forbidden — use text classes.

## Decisions — RN implementation (rules in `../CLAUDE.md`)
1. **Handoff**: `keyValueStorage` + `TAuthHandoff` in `features/auth/utils/auth-handoff.store.ts`. Never via route params.
2. **OTP + countdown**: `OtpCodeInput` + `CountdownResend` (shared molecules) + `useCountdown` (shared hook).
3. **Refresh token**: http client Bearer; single-flight via a shared promise in `shared/lib/auth`; failure → session-expired event → `useSession` guest → `(private)` guard redirect.
4. **Pagination**: `toCursorPage(json, listKey)` + `useAppInfiniteQuery` with `getNextPageParam: (p) => p.nextCursor ?? undefined`.
5. **Home "/"**: one query `distributorSearchQuery(filter)`, filter in the key.
6. **Errors**: `AppError { status, code, message, details }`; UI shows `getErrorMessage(error)` from `@/shared/lib/http`.
7. **Modals**: `@/shared/lib/sheet`, files `features/<x>/components/<name>-sheet.tsx`.
8. **Guest vs logged in**: `useSession()` from `@/features/auth`.
9. **Realtime**: `realtimeClient` in `shared/lib/realtime`, `auth` callback reads `tokenStore`.
10. **Map**: `AppMap` (`UrlTile`, `mapType="none"` on Android).

## Conventions
- Files/folders kebab-case. Suffixes: `.service.ts`, `.queries.ts`, `.schema.ts`, `.types.ts`, `.util.ts`, `.constants.ts`, `.store.ts`, `-sheet.tsx`. Hooks `use-xxx.ts`. Types `TXxx`, interfaces `IXxx`, enums `EXxx` (as in client/server). Components: named export PascalCase; default export only in `src/app/**` route files.
- Styling: NativeWind `className` with semantic tokens (`bg-primary`, `text-highlight`, `border-border-subtle`, `rounded-lg`); variants via `cva`; merge via `cn`. Props that need a color value (icons, `ActivityIndicator`, `placeholderTextColor`, map markers) read `colors` from `@/shared/theme`.
- Components handle loading / empty / error; min tap target 44pt; `accessibilityLabel` on icon buttons.
- Server error text via `getErrorMessage`.
- Env: `ui_ux_rn/.env` (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL`, `EXPO_PUBLIC_MAP_TILE_URL`); `.env.example` committed. Android emulator reaches host via `10.0.2.2`.
- Native dirs (`ios/`, `android/`) generated by `npx expo prebuild`, not committed. `openapi.d.ts` is committed.
