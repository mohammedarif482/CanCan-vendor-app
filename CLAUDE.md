# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Can Can Vendor is a Flutter mobile application for water can delivery vendors. The app allows vendors to manage their water can delivery business, including order management, inventory tracking, payment processing, and customer interactions.

## Technology Stack

- **Framework**: Flutter (Dart SDK >=3.0.0)
- **Backend**: Supabase (authentication, database, real-time)
- **State Management**: Provider pattern
- **UI**: Material Design 3 with custom Agrandir font theme
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Phone Auth**: Supabase Auth with OTP (currently in TEST MODE)

## Development Commands

### Essential Commands
```bash
# Install dependencies
flutter pub get

# Run the app (requires connected device or emulator)
flutter run

# Run all tests
flutter test

# Analyze code for issues
flutter analyze

# Build for Android
flutter build apk --release
flutter build appbundle --release

# Build for iOS
flutter build ios

# Generate app icons (after updating icon assets)
flutter pub run flutter_launcher_icons
```

### Environment Setup
Before running the app, create a `.env` file in the root directory with:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key
```

The `.env` file must be added to `pubspec.yaml` under assets (already configured) and **should not be committed** to version control.

### Supabase Database Setup Required
For production mode (supabase/integration branch), ensure your Supabase project has these tables:

1. **vendors** table:
   - id (UUID, primary key)
   - phone (text, unique)
   - name (text)
   - business_name (text)
   - address (text)
   - is_active (boolean)
   - is_on_vacation (boolean)
   - max_daily_deliveries (integer)
   - max_daily_cans (integer)
   - working_hours (jsonb)
   - working_days (array of text)
   - created_at, updated_at (timestamps)

2. **orders** table:
   - id (UUID, primary key)
   - order_number (text, unique)
   - vendor_id (UUID, foreign key to vendors)
   - customer_id (UUID, foreign key to customers)
   - delivery_date (date)
   - time_slot (text)
   - total_amount (numeric)
   - status (text: pending/completed/cancelled)
   - is_delivered (boolean)
   - delivered_at (timestamp)
   - payment_status (text: paid/unpaid)
   - payment_marked_at (timestamp)
   - notes (text)
   - cancellation_reason (text)
   - created_at (timestamp)

3. **customers** table:
   - id (UUID, primary key)
   - name (text)
   - phone (text)
   - address (text)
   - flat_number (text)
   - floor (text)
   - building_name (text)

4. **order_items** table:
   - id (UUID, primary key)
   - order_id (UUID, foreign key to orders)
   - product_id (UUID, foreign key to products)
   - quantity (integer)
   - unit_price (numeric)
   - subtotal (numeric)

5. **products** table:
   - id (UUID, primary key)
   - name (text)
   - price (numeric)
   - is_active (boolean)

6. **inventory** table:
   - id (UUID, primary key)
   - vendor_id (UUID, foreign key to vendors)
   - product_id (UUID, foreign key to products)
   - current_stock (integer)
   - low_stock_threshold (integer)
   - updated_at (timestamp)

## Architecture Overview

### Directory Structure
```
lib/
├── config/           # App configuration (theme, constants, Supabase)
├── models/           # Data models (Order, Customer, etc.)
├── screens/          # UI screens organized by feature
│   ├── auth/        # Login, OTP, Profile Setup
│   ├── home/        # Main dashboard with bottom nav
│   ├── inventory/   # Stock management
│   ├── payments/    # Payment tracking
│   ├── history/     # Order history
│   ├── qr_code/     # QR code generation/scanning
│   ├── catalog/     # Product catalog
│   ├── vacation/    # Vacation mode settings
│   └── settings/    # App settings
├── services/         # Business logic and API calls
├── widgets/          # Reusable UI components
└── utils/            # Helper utilities
```

### Key Configuration Files
- `lib/config/supabase_config.dart`: Supabase initialization and client access
- `lib/config/theme.dart`: App-wide theme constants, colors, 8dp spacing grid, and Material theme
- `.env`: Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY) - **do not commit**

### Key Architecture Patterns

1. **Authentication Flow**: Login → OTP Verification → Profile Setup → Home
2. **Navigation**: `HomeScreen` hosts bottom navigation bar with 4 tabs (Home, History, Payments, Inventory)
3. **State Management**: Provider pattern for state distribution
4. **Backend Integration**: Supabase for authentication, real-time database, and storage

### Data Models
- `Order`: Core model with nested `Customer`, `OrderItem`, and `Product`
- All models include `fromJson()` factory constructors for Supabase response parsing
- Database column names use snake_case (e.g., `order_number`) mapped to camelCase Dart fields

### Services Layer
- `AuthService`: Phone OTP authentication with TEST MODE flag
- `OrderService`: Order management with dummy data toggle (`_useDummyData`)
- `VendorService`: Vendor profile management
- `InventoryService`: Stock tracking and automatic deduction on delivery
- `SessionService`: Local session persistence via SharedPreferences

### Navigation Pattern
- `HomeScreen` hosts the bottom navigation bar with 4 tabs
- Each tab renders its screen directly in the body (no routing between tabs)
- `ScreenWithNav` wrapper provides nav bar for detail screens
- `AppBottomNavBar` reusable bottom navigation widget
- Auth flow uses named routes: `/login`, `/home`

### Testing Mode Flags
Two important flags control test vs production behavior:

1. **AuthService._testMode** (lib/services/auth_service.dart:11)
   - `true`: Bypasses real OTP, accepts "123456", uses mock session
   - `false`: Real Supabase phone OTP authentication
   - **Current status**: `false` (production mode enabled)

2. **OrderService._useDummyData** (lib/services/order_service.dart:12)
   - `true`: Returns hardcoded Tamil dummy data for UI development
   - `false`: Fetches real data from Supabase orders table
   - **Current status**: `false` (real Supabase data enabled)

### Branch Configuration
- **rapid-prototyping branch**: Test mode enabled, dummy data for development
- **supabase/integration branch**: Production mode enabled, real Supabase cloud sync
- **main branch**: Production ready (merge from supabase/integration)

To switch between development and production modes, use the appropriate branch.

### Session Management Pattern
The app uses a hybrid authentication approach:

1. **Production Mode** (Supabase Auth):
   - Uses Supabase's `auth.currentUser` for authentication
   - Vendor ID comes from Supabase user ID

2. **Test Mode** (Mock Session):
   - Uses `SessionService` (SharedPreferences) to persist lightweight session data
   - Stores: `vendorId`, `vendorPhone`, `hasProfile`
   - Allows skipping login on app restart

3. **Vendor ID Resolution** (SupabaseConfig.currentVendorId):
   - Priority 1: Authenticated Supabase user ID
   - Priority 2: Locally stored vendor session (SessionService.vendorId)

This hybrid approach allows UI development without real Supabase auth while maintaining compatibility with production auth flow.

### Theme System
- Uses custom Agrandir font (assets/fonts/) - NOT Google Fonts
- 8dp spacing grid system with constants in `AppTheme` (spacingXS through spacingXXXL)
- Predefined padding constants (paddingXS, paddingHorizontalL, etc.)
- Primary color: `#4A90E2` (blue)
- Status colors: pending (orange), completed (green), cancelled (red)

### Database Schema (Supabase)
Key tables referenced in code:
- `vendors`: Vendor profiles
- `orders`: Orders with delivery dates, time slots, status
- `customers`: Customer addresses and contact info
- `order_items`: Order line items with quantities
- `products`: Product catalog (water cans)

### App Initialization Flow (main.dart)
1. `WidgetsFlutterBinding.ensureInitialized()` - Initialize Flutter bindings
2. `SystemChrome.setPreferredOrientations()` - Lock to portrait mode
3. `SupabaseConfig.initialize()` - Load .env and initialize Supabase client
4. `SessionService.init()` - Initialize SharedPreferences for local session
5. `CanCanApp` checks authentication state and routes to LoginScreen or HomeScreen

### Order Management & Inventory Integration
When an order is marked as delivered via `OrderService.updateOrderStatus()`:
- Order status changes to "completed"
- `InventoryService.deductStockForOrder()` is automatically called
- Stock is deducted based on order items (product quantities)
- This integration prevents overselling and maintains accurate inventory

## Development Notes

### Code Quality
- Uses `flutter_lints` for code analysis (see analysis_options.yaml)
- Follows Material Design 3 guidelines
- Implements proper error handling throughout the app

### Asset Management
- App icons should be placed in `assets/icons/`
- Images should be placed in `assets/images/`
- Agrandir font files in `assets/fonts/`
- After updating icon assets, run `flutter pub run flutter_launcher_icons`

### Testing
- Test files should be placed in `test/` directory
- Use `flutter test` to run all tests
- Widget tests use `flutter_test` framework

### Platform-Specific Considerations
- Android: Configured and ready to build
- iOS: Basic configuration present but may need additional setup
- App currently locked to portrait orientation

### Print Debugging
The codebase uses extensive `print()` statements for debugging (prefixed with emoji indicators like ✅, ❌, 📦, 🧪). These are intentional for development and should remain for debugging complex flows.

### Code Conventions & Patterns

1. **Named Parameters**: All service methods use named parameters with `required` for clarity
2. **Return Types**: Services return `Map<String, dynamic>` with `success` boolean and `message` string for API responses
3. **Async/Await**: All I/O operations (database, network) use proper async/await patterns
4. **State Management**: UI components use local `StatefulWidget` with service instances (no Provider patterns yet)
5. **Model Conventions**:
   - All models have `fromJson()` factory constructors for Supabase response parsing
   - Database column names use snake_case, mapped to camelCase Dart fields
   - Models include `toJson()` for serialization (though rarely used)
6. **Screen Organization**:
   - Screens in `lib/screens/` are organized by feature (auth/, home/, inventory/, etc.)
   - Feature-specific widgets are co-located in `widgets/` subdirectories (e.g., `lib/screens/home/widgets/`)
   - Reusable cross-screen widgets are in `lib/widgets/`

### Push Notifications
- Firebase Messaging for FCM tokens
- flutter_local_notifications for local notifications
- Permission handling via permission_handler

### Key Dependencies
- `supabase_flutter`: Backend-as-a-service integration
- `provider`: State management
- `pinput`: OTP input fields
- `qr_flutter`: QR code generation
- `url_launcher`: Launch external URLs (WhatsApp, phone calls)
- `image_picker`: Camera and gallery access
- `firebase_messaging`: Push notifications
- `cached_network_image`: Optimized image loading
- `shared_preferences`: Local data persistence
- `flutter_dotenv`: Environment variable management
