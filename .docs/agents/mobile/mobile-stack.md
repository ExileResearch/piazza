# Piazza — Mobile Technical Stack

Flutter/Dart, GetX, Freezed/json_annotation, Flutter Hooks, flutter_secure_storage, cached_network_image with private-cache controls and flutter_lucide. Pin compatible maintained versions when building. Android minSDK 26, target SDK chosen against current release requirements at implementation; Google Play signed AAB. No iOS, Isar, write queue, WorkManager sync, Riverpod/BLoC/Redux/provider, secondary router or HTTP stack.

## Layers

lib/core/services contains GetxService ApiService/AuthService/ThemeService/LocaleService; core/routes named routes/GetMiddleware/Bindings; core/models generated wire DTOs; core/i18n GetX Translations; core/theme mapped light/dark tokens. features/auth, control, agents, discover, projects, tasks, inquiries, evidence, social, artifacts and settings each own GetxController, route Binding and views. HookWidget hooks own widget-scoped text/focus/animation lifecycle only. Services hold transport/auth data, not UI view state; controller .obs state drives Obx. No setState for app state.

Generate models from checked backend OpenAPI export via an evaluated codegen pipeline supporting Freezed/json_annotation. Do not assume an arbitrary generator already emits the exact selected annotations: establish reproducible transformation/fixture tests first. build_runner generates Freezed/JSON/mocks; generated files are committed for review with CI regeneration/diff checks (derived convention). Required/nullable/enums/date mappings match canonical Zod; document OpenAPI metadata derivation from backend contracts. mobile never consumes file: TypeScript dependencies.

ApiService wraps GetConnect request modifiers, stable error envelope decoding, rate-limit backoff and one refresh attempt/single-flight. Only allowlisted API targets receive bearer tokens. TLS/pinning covers API with a backup-pin/rotation strategy before release. Secure tokens use Keystore-backed storage; no credentials in preferences, logs or binaries. API base URL is public environment config, not an embedded provider key. Local storage is limited to consented nonsensitive preferences; no protected offline DB. cached_network_image must not persist private media across logout or grant loss; bypass disk cache where clearing cannot be reliably guaranteed.

## Presentation and build

Dark-first and light mode; canvas #25282A/#E4E4E7, muted #A1A1AA, interactive #6F8F82, category #8A6D3B, destructive #AF231C. Inter/JetBrains Mono with Gurmukhi/CJK-capable fallbacks; Lucide; measured contrast, keyboard focus, semantic labels and reduced motion. Interface/policy/system messages in en/fr/es/pa/zh; authored content unchanged and untranslated. No tracking SDK, ads, unselected animation or payment integration.

Map tokens to ThemeData; Tailwind is a web tool and is not a Flutter dependency. Bundle appropriately licensed font assets or use documented system fallbacks, with Gurmukhi/CJK tests. .tr for every string, Get.changeTheme and explicit locale setter; 48dp, TalkBack, dynamic type and reduced motion. Get dialogs/snackbars/sheets only.

apps/mobile-client owns pubspec.yaml/pubspec.lock, analysis_options, android configuration, openapi.json and app README. Android Dockerfile can run supported analyze/test/AAB build tasks from root context; signing keys are owner-held external secrets, not image content. Emulator/native CI runs as suitable runners, not Compose services.

Quality: dart format, flutter analyze, unit/widget tests, DTO fixtures/parity, integration_test E01–E10/E12/E13/E15 and report-role denial, TalkBack/font-scale review, no queued reconnect mutations, signed internal-track install. Record certificate pin rotation and auth recovery evidence before shipping.
