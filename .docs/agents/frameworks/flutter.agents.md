---
name: "Flutter (GetX + Freezed + Isar) Mobile Development Guide"
description: "Best practices for building Flutter mobile apps with GetX (state, DI, routing, i18n, HTTP), Freezed data classes, Flutter Hooks lifecycle, Isar offline sync, and a REST API with AppWrite/VersityGW object storage."
category: "Mobile Framework"
tags:
  [
    "flutter",
    "dart",
    "mobile-development",
    "getx",
    "freezed",
    "isar",
    "flutter-hooks",
    "offline-first",
  ]
lastUpdated: "2026-10-19"
---

# Flutter (GetX + Freezed + Isar) Mobile Development Guide

## Project Overview

This guide defines how mobile clients are built in this package set: Flutter/Dart, **GetX** for state, dependency injection, routing, localization, dialogs and HTTP, **Freezed** for immutable data classes, **Flutter Hooks** for widget lifecycle, and **Isar** for the offline data layer. The backend is a REST API; object storage (AppWrite or VersityGW) sits behind it and is never accessed directly with credentials from the app.

## Tech Stack

- **Framework**: Flutter 3.16+
- **Language**: Dart 3.2+
- **State Management**: GetX
- **Data Classes**: Freezed + json_annotation
- **Lifecycle Management**: Flutter Hooks
- **Backend**: REST API; AppWrite/VersityGW S3 object stores (server-mediated)
- **Offline Sync**: Isar
- **Navigation**: GetX
- **HTTP Client**: GetX (`GetConnect`)
- **Localization**: GetX (`Translations` + `.tr`)
- **Image Handling**: `cached_network_image`
- **Code Generation**: `build_runner`
- **Testing**: `flutter_test`, `mockito`
- **Icons**: `flutter_lucide`

> **Never add** Riverpod, BLoC, Redux, `provider`, `go_router`, `dio`, or `intl`-based ad-hoc i18n to this stack. GetX owns state/DI/routing/i18n/HTTP; Isar owns offline data.

## Development Environment Setup

### Installation Requirements

- Flutter SDK 3.16+
- Dart SDK 3.2+
- Android Studio / VS Code with Flutter extensions
- Xcode (only if iOS is in scope; the default target is Android)

### Installation Steps

```bash
# Runtime dependencies
flutter pub add get
flutter pub add freezed_annotation json_annotation
flutter pub add flutter_hooks
flutter pub add isar isar_flutter_libs
flutter pub add cached_network_image
flutter pub add flutter_lucide
flutter pub add flutter_secure_storage

# Development dependencies
flutter pub add --dev build_runner freezed json_serializable isar_generator
flutter pub add --dev mockito
flutter pub add --dev flutter_test

# Generate code (Freezed, JSON, Isar schemas, mocks)
dart run build_runner build --delete-conflicting-outputs
```

## Project Structure

```
mobile-client/
├── lib/
│   ├── main.dart                    # bindings, Isar.open, GetxService registration, GetMaterialApp
│   ├── core/
│   │   ├── services/                # GetxService singletons
│   │   │   ├── api_service.dart     # GetConnect + auth interceptor
│   │   │   ├── auth_service.dart    # tokens, refresh, current user
│   │   │   ├── storage_service.dart # Isar instance + local queries
│   │   │   ├── theme_service.dart
│   │   │   └── locale_service.dart
│   │   ├── routes/                  # GetPage + GetMiddleware + Bindings
│   │   ├── i18n/                    # GetX Translations (en/fr/es/pa/zh)
│   │   ├── theme/                   # light/dark ThemeData from design tokens
│   │   ├── models/                  # Freezed DTOs (from the OpenAPI document)
│   │   └── db/                      # Isar collections + sync queue
│   ├── features/
│   │   └── <feature>/
│   │       ├── <feature>_controller.dart
│   │       ├── <feature>_binding.dart
│   │       └── views/
│   └── shared/                      # small presentational widgets
├── test/                            # unit + widget tests
├── integration_test/                # on-device E2E
├── pubspec.yaml
└── analysis_options.yaml
```

Generated files (`*.g.dart`, `*.freezed.dart`, `*.mocks.dart`) are produced by `build_runner` and are not hand-edited. Either gitignore them and generate in CI, or commit them — pick one per repo and document it in `AGENTS.md`.

## Key Principles and Guidelines

### GetX Architecture

- **Services** are app-wide singletons that extend `GetxService` and are registered once in `main()`. They hold no UI state.
- **Controllers** extend `GetxController`, hold feature state, call services, and are registered per route through a `Bindings` class.
- **Views** observe controller state with `Obx` (or `GetBuilder` for one-shot reads) and contain no business logic.
- **Never** use `setState` for application state.

### Naming and Style

- Files: `snake_case.dart`; classes/types: `PascalCase`; members: `camelCase`.
- Reactive fields end with `.obs` (`final isLoading = false.obs;`).
- Use `const` constructors for immutable widgets; prefer small private widget classes over `_buildX()` methods.
- Keep lines ≤ 80 characters, trailing commas for formatting.
- Use `log`/`debugPrint`, never `print`.

### File Structure Convention

```dart
// link_detail_view.dart — exported widget, private subwidgets, helpers
class LinkDetailView extends StatelessWidget {
  const LinkDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('link.detail.title'.tr)),
      body: const _LinkDetailBody(),
    );
  }
}

class _LinkDetailBody extends StatelessWidget {
  const _LinkDetailBody();

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<LinkController>();
    return Obx(() {
      if (controller.isLoading.value) return const _LoadingView();
      if (controller.error.value != null) {
        return _ErrorView(message: controller.error.value!, onRetry: controller.load);
      }
      final link = controller.link.value;
      if (link == null) return _EmptyView(message: 'link.empty'.tr);
      return _LinkDetails(link: link);
    });
  }
}
```

## Core Feature Implementation

### Services (GetxService)

```dart
// core/services/api_service.dart
class ApiService extends GetxService {
  late final GetConnect _client;
  final _auth = Get.find<AuthService>();

  Future<ApiService> init() async {
    _client = GetConnect(
      baseUrl: Environment.apiBaseUrl,
      timeout: const Duration(seconds: 30),
    );
    _client.httpClient.addRequestModifier((request) {
      final token = _auth.accessToken.value;
      if (token != null) request.headers['Authorization'] = 'Bearer $token';
      return request;
    });
    _client.httpClient.addAuthenticator((request) async {
      await _auth.refresh();
      request.headers['Authorization'] = 'Bearer ${_auth.accessToken.value}';
      return request;
    });
    return this;
  }

  Future<T> get<T>(String path, {Map<String, dynamic>? query}) async {
    final response = await _client.get<T>(path, query: query);
    if (!response.isOk) throw ApiException.fromResponse(response);
    return response.body as T;
  }

  Future<T> post<T>(String path, {Object? body}) async {
    final response = await _client.post<T>(path, body: body);
    if (!response.isOk) throw ApiException.fromResponse(response);
    return response.body as T;
  }
}
```

### Controllers and Bindings (GetxController)

```dart
// features/links/links_controller.dart
class LinksController extends GetxController {
  final _api = Get.find<ApiService>();
  final _storage = Get.find<StorageService>();

  final links = <Link>[].obs;
  final isLoading = false.obs;
  final error = RxnString();

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    isLoading.value = true;
    error.value = null;
    try {
      links.assignAll(await _storage.cachedLinks());
      links.assignAll(await _api.get<List<Link>>('/api/v1/links'));
      await _storage.replaceLinks(links);
    } on ApiException catch (e) {
      error.value = e.localisedKey;
    } finally {
      isLoading.value = false;
    }
  }
}

// features/links/links_binding.dart
class LinksBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => LinksController(), fenix: true);
  }
}
```

### Freezed Data Models

```dart
// core/models/link.dart
part 'link.freezed.dart';
part 'link.g.dart';

@freezed
class Link with _$Link {
  const factory Link({
    required String id,
    required String url,
    required String title,
    @Default(<String>[]) List<String> tags,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _Link;

  factory Link.fromJson(Map<String, dynamic> json) => _$LinkFromJson(json);
}

// Union for view state — replaces nullable soup
@freezed
sealed class LoadState<T> with _$LoadState<T> {
  const factory LoadState.idle() = Idle<T>;
  const factory LoadState.loading() = Loading<T>;
  const factory LoadState.ready(T data) = Ready<T>;
  const factory LoadState.error(String messageKey) = LoadError<T>;
}
```

### Error Handling

Map stable API error codes to localized keys in one place, then surface them with GetX:

```dart
class ApiException implements Exception {
  const ApiException(this.code, {this.fields = const {}});
  final String code;
  final Map<String, String> fields;

  String get localisedKey => 'error.$code'.tr;

  factory ApiException.fromResponse(Response<dynamic> response) {
    final body = response.body;
    if (body is Map<String, dynamic> && body['code'] is String) {
      return ApiException(body['code'] as String);
    }
    return ApiException('unknown');
  }
}

// In a controller:
error.value = e.localisedKey;
Get.snackbar('common.error'.tr, e.localisedKey, snackPosition: SnackPosition.BOTTOM);
```

## Flutter Hooks Integration

Hooks own **widget-scoped lifecycle** (text/animation controllers, focus, debouncing, one-shot effects). App state stays in GetX.

```dart
class SearchView extends HookWidget {
  const SearchView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = useTextEditingController();
    final focusNode = useFocusNode();
    final debounced = useDebounced(controller.text, const Duration(milliseconds: 400));
    final linksController = Get.find<LinksController>();

    useEffect(() {
      focusNode.requestFocus();
      return null;
    }, const []);

    useEffect(() {
      linksController.search(debounced);
      return null;
    }, [debounced]);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: controller,
          focusNode: focusNode,
          decoration: InputDecoration(hintText: 'search.hint'.tr),
        ),
      ),
      body: Obx(() => LinksList(links: linksController.links)),
    );
  }
}

String useDebounced(String value, Duration duration) {
  final debounced = useState(value);
  useEffect(() {
    final timer = Timer(duration, () => debounced.value = value);
    return timer.cancel;
  }, [value]);
  return debounced.value;
}
```

**Rules of hooks:** never call hooks conditionally or inside loops; keep hook order stable across rebuilds.

## Isar Offline Sync

Isar is the offline data layer: collections mirror the DTOs, queries are indexed, and `.watch()` gives reactive streams. A sync queue collection holds pending writes.

```dart
// core/db/link_record.dart
part 'link_record.g.dart';

@collection
class LinkRecord {
  Id id = Isar.autoIncrement;
  @Index(unique: true, replace: true)
  late String remoteId;
  late String url;
  late String title;
  late DateTime updatedAt;
  bool deleted = false;
}

// core/db/pending_write.dart
@collection
class PendingWrite {
  Id id = Isar.autoIncrement;
  late String entity;
  late String remoteId;
  late String payload; // JSON
  late DateTime queuedAt;
}

// core/services/storage_service.dart
class StorageService extends GetxService {
  late final Isar _isar;

  Future<StorageService> init() async {
    _isar = await Isar.open([LinkRecordSchema, PendingWriteSchema]);
    return this;
  }

  Stream<List<LinkRecord>> watchLinks() =>
      _isar.linkRecords.where().sortByUpdatedAtDesc().watch(fireImmediately: true);

  Future<void> save(LinkRecord record) => _isar.writeTxn(() => _isar.linkRecords.put(record));

  Future<void> enqueue(PendingWrite write) =>
      _isar.writeTxn(() => _isar.pendingWrites.put(write));
}
```

**Offline rules**

- Reads come from Isar; the network refresh updates Isar.
- Writes apply locally first and enqueue a `PendingWrite`.
- On reconnect, flush the queue; reconcile **last-write-wins per field** using server timestamps.
- Surface a conflict only when data would otherwise be lost.
- Close the Isar instance on app teardown; open it once after `WidgetsFlutterBinding.ensureInitialized()`.

## Object Storage (AppWrite / VersityGW)

Object storage is **server-side**. The app never holds storage credentials.

- Media references come from the API (file IDs / keys); fetch bytes via short-lived presigned URLs.
- Uploads are server-mediated: request a presigned PUT (or upload through the API for small files), then confirm the media ref.
- Cache remote images with `cached_network_image`; always provide `placeholder` and `errorWidget`.
- Respect MIME/size limits enforced by the server; never trust a client-side check alone.

## UI Components and Performance

### Lists and Images

```dart
ListView.builder(
  itemCount: links.length,
  itemBuilder: (context, index) {
    final link = links[index];
    return ListTile(
      leading: CachedNetworkImage(
        imageUrl: link.imageUrl,
        width: 48,
        height: 48,
        fit: BoxFit.cover,
        placeholder: (_, __) => const _Skeleton(width: 48, height: 48),
        errorWidget: (_, __, ___) => const Icon(LucideIcons.imageOff),
      ),
      title: Text(link.title),
      onTap: () => Get.toNamed(Routes.linkDetail, arguments: link),
    );
  },
)
```

Use `ListView.builder` for long lists; `const` widgets; `flutter_lucide` icons with visible labels or semantic names; responsive layout via `LayoutBuilder`.

## Navigation with GetX

```dart
// core/routes/app_pages.dart
abstract class Routes {
  static const home = '/';
  static const login = '/auth/login';
  static const links = '/links';
  static const linkDetail = '/links/detail';
}

class AppPages {
  static final pages = <GetPage>[
    GetPage(name: Routes.home, page: () => const HomeView()),
    GetPage(name: Routes.login, page: () => const LoginView()),
    GetPage(
      name: Routes.links,
      page: () => const LinksView(),
      binding: LinksBinding(),
      middlewares: [AuthMiddleware()],
    ),
  ];
}

class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) =>
      Get.find<AuthService>().isAuthenticated.value ? null : const RouteSettings(name: Routes.login);
}
```

Navigate only via named routes (`Get.toNamed`, `Get.offAllNamed`). Never construct `MaterialPageRoute` ad hoc.

## Best Practices Summary

### GetX

- `GetxService` for app-wide singletons, registered once in `main()`; `GetxController` per feature.
- `.obs` + `Obx` for UI state; `computed`-equivalent getters for derivations; no `setState`.
- Route `Bindings` with `Get.lazyPut(..., fenix: true)`; dispose with the route.
- `GetMiddleware` for auth gating; named routes only.
- `Get.dialog`, `Get.snackbar`, `Get.bottomSheet` for all feedback.
- `.tr` for every user-visible string; no hard-coded copy.

### Freezed

- Immutable models with `copyWith`, `==`/`hashCode`, JSON.
- Use unions (`sealed class` + Freezed) for load/auth states instead of nullable fields.
- Re-run `build_runner` after every model change; never hand-edit generated files.

### Isar

- Isar is the offline cache + write queue — **not** `GetStorage` (key-value only, no queries/watchers).
- Index the fields you filter/sort on; open the database once; close it on teardown.
- Store secrets in `flutter_secure_storage`, never in Isar or key-value stores.

### Hooks

- Hooks for widget lifecycle and ephemeral controllers; GetX for app state.
- Never call hooks conditionally; keep a stable hook order.

### Testing

- `flutter_test` for unit + widget tests; `mockito` with `@GenerateMocks` and `build_runner`.
- `integration_test` for on-device E2E.
- Mock at the service boundary; never mock the code under test.

### Performance

- `const` widgets, `ListView.builder`, bounded image caches.
- Avoid rebuilding whole trees from a single `.obs`; scope `Obx` tightly.
- Respect platform reduce-motion; test on a low-end device.

### Workflow

- `dart run build_runner build --delete-conflicting-outputs` after annotation changes.
- `dart format .`, `flutter analyze`, `flutter test` green before each commit.
- `log`/`debugPrint`, never `print`.

## References

- https://flutter.dev
- https://pub.dev/packages/get
- https://pub.dev/packages/freezed
- https://pub.dev/packages/isar
- https://pub.dev/packages/flutter_hooks
- https://pub.dev/packages/cached_network_image
- https://pub.dev/packages/flutter_lucide
- https://pub.dev/packages/mockito
- https://github.com/versity/versitygw
