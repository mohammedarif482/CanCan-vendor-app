/// App-wide constants for Can Can Vendor App
class AppConstants {
  // App Info
  static const String appName = 'Can Can';
  static const String appVersion = '1.0.0';

  // Next.js backend (admin portal + WhatsApp webhook) — used for actions
  // that need server-side side effects (WhatsApp notify, payment reversal),
  // not just a Supabase row write.
  static const String apiBaseUrl = 'https://cancanindia.com';

  // Time Slots
  static const List<String> timeSlots = [
    '8am - 12pm',
    '12pm - 3pm',
    '3pm - 9pm',
  ];

  // Maps raw time_slot values (however they were stored — WhatsApp orders
  // store 'morning'/'noon'/'evening', vendor-app-created orders store the
  // range string directly) to one consistent human-readable range, so a
  // vendor never sees a literal "morning" label on an order card.
  static const Map<String, String> _timeSlotAliases = {
    'morning': '8am - 12pm',
    'noon': '12pm - 3pm',
    'afternoon': '12pm - 3pm',
    'evening': '3pm - 9pm',
  };

  static String formatTimeSlot(String raw) {
    final key = raw.trim().toLowerCase();
    return _timeSlotAliases[key] ?? raw;
  }

  // Order Status
  static const String statusPending = 'pending';
  static const String statusCompleted = 'completed';
  static const String statusCancelled = 'cancelled';

  // Payment Status
  static const String paymentUnpaid = 'unpaid';
  static const String paymentPaid = 'paid';

  // Payment Methods
  static const String paymentCash = 'cash';
  static const String paymentUPI = 'upi';

  // Transaction Types
  static const String transactionOrderPlaced = 'order_placed';
  static const String transactionPaymentReceived = 'payment_received';
  static const String transactionDepositPaid = 'deposit_paid';
  static const String transactionDepositRefunded = 'deposit_refunded';

  // Inventory Change Types
  static const String inventoryStockAdded = 'stock_added';
  static const String inventoryStockReduced = 'stock_reduced';
  static const String inventoryOrderDelivered = 'order_delivered';
  static const String inventoryManualAdjustment = 'manual_adjustment';

  // Default Values
  static const int defaultMaxDailyDeliveries = 100;
  static const int defaultMaxDailyCans = 120;
  static const int defaultLowStockThreshold = 10;

  // Date Formats
  static const String dateFormatDisplay = 'dd MMM yyyy'; // 20 Sep 2025
  static const String dateFormatFull =
      'EEEE, dd MMM yyyy'; // Monday, 20 Sep 2025
  static const String timeFormat = 'hh:mm a'; // 09:00 AM

  // Validation
  static const int phoneNumberLength = 10; // Indian phone numbers
  static const String phonePrefix = '+91';

  // Regex Patterns
  static final Pattern phoneRegex =
      RegExp(r'^[6-9]\d{9}$'); // Indian mobile numbers

  // WhatsApp
  static const String whatsappBusinessNumber = '919025320535';

  static String getWhatsAppLink(String phone, String message) {
    return 'https://wa.me/$phone?text=${Uri.encodeComponent(message)}';
  }

  // Customer Order Link (for QR code)
  // Route all customers to Can Can business WhatsApp with vendor context.
  static String getCustomerOrderLink(String vendorId) {
    final message = 'ref-$vendorId';
    return getWhatsAppLink(whatsappBusinessNumber, message);
  }

  // Support Contact
  static const String supportEmail = 'support@cancanindia.com';
  static const String supportPhone = '9025320535';

  // Legal Links
  static const String termsOfServiceUrl = 'https://cancanindia.com/terms';
  static const String privacyPolicyUrl = 'https://cancanindia.com/privacy';

  // Storage Buckets
  static const String bucketVendorProfiles = 'vendor-profiles';
  static const String bucketQRCodes = 'qr-codes';
  static const String bucketCertificates = 'certificates';

  // Notification Types
  static const String notificationNewOrder = 'new_order';
  static const String notificationLowStock = 'low_stock';
  static const String notificationPaymentReminder = 'payment_reminder';
  static const String notificationVacationReminder = 'vacation_reminder';

  // Working Days
  static const List<String> weekDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  static const Map<String, String> weekDayLabels = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun',
  };
}
