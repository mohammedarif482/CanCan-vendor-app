import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../config/supabase_config.dart';

/// Vendor proposes a new service location — takes effect only after Can Can
/// approves it (see frontend/src/app/api/vendors/[id]/location-change).
class VendorLocationApi {
  Future<Map<String, dynamic>> requestLocationChange({
    required String vendorId,
    required double latitude,
    required double longitude,
    String? address,
  }) async {
    final session = SupabaseConfig.client.auth.currentSession;
    if (session == null) {
      return {'success': false, 'message': 'Not authenticated. Please login again.'};
    }

    try {
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/api/vendors/$vendorId/location-change'),
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'latitude': latitude, 'longitude': longitude, 'address': address}),
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
}
