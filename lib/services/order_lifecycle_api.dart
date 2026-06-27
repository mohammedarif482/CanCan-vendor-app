import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../config/supabase_config.dart';

/// Calls backend endpoints that need server-side side effects (WhatsApp
/// notification to the customer, payment reversal, stock release) beyond a
/// plain Supabase row update — postponing or cancelling an order.
class OrderLifecycleApi {
  Future<Map<String, dynamic>> _post(String path, [Map<String, dynamic>? body]) async {
    final session = SupabaseConfig.client.auth.currentSession;
    if (session == null) {
      return {'success': false, 'message': 'Not authenticated. Please login again.'};
    }

    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}$path'),
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body ?? {}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': jsonDecode(response.body)};
      }

      String message = 'Request failed (${response.statusCode})';
      try {
        final decoded = jsonDecode(response.body);
        if (decoded is Map && decoded['error'] is String) message = decoded['error'];
      } catch (_) {}
      return {'success': false, 'message': message};
    } catch (e) {
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  Future<Map<String, dynamic>> postponeOrder(String orderId) {
    return _post('/api/orders/$orderId/postpone');
  }

  Future<Map<String, dynamic>> cancelOrder(String orderId, {String? reason}) {
    return _post('/api/orders/$orderId/cancel', {'reason': reason});
  }

  /// Records a cash payment the vendor collected in person. Creates a real
  /// `payments` audit row (unlike writing orders.amount_paid directly) and
  /// correctly skips a wallet credit since the vendor already holds the cash.
  Future<Map<String, dynamic>> recordCashPayment(String orderId, double amount) {
    return _post('/api/orders/$orderId/cash-payment', {'amount': amount});
  }
}
