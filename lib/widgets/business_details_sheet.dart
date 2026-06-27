import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/theme.dart';
import '../services/vendor_data_service.dart';
import '../services/vendor_location_api.dart';
import '../utils/localization_extension.dart';

/// Shared Business Details edit sheet — used from both the drawer and
/// Settings, so there's exactly one place vendors can view/edit their
/// profile instead of two near-duplicate editors.
void showBusinessDetailsSheet({
  required BuildContext context,
  required Map<String, dynamic>? vendorData,
  required Future<void> Function() onUpdated,
}) {
  final originalName = vendorData?['name'] ?? '';
  final originalBusinessName = vendorData?['business_name'] ?? '';
  final originalAddress = vendorData?['address'] ?? '';
  final latitude = (vendorData?['latitude'] as num?)?.toDouble();
  final longitude = (vendorData?['longitude'] as num?)?.toDouble();
  final locationChangeStatus = vendorData?['location_change_status'] as String?;
  final vendorId = vendorData?['id'] as String?;

  final nameController = TextEditingController(text: originalName);
  final businessNameController = TextEditingController(text: originalBusinessName);
  final addressController = TextEditingController(text: originalAddress);
  bool isSaving = false;

  bool isDirty() =>
      nameController.text.trim() != originalName ||
      businessNameController.text.trim() != originalBusinessName ||
      addressController.text.trim() != originalAddress;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppTheme.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      context.tr('business_details'),
                      style: Theme.of(context).textTheme.titleLarge,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                context.tr('vendor_name'),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: nameController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: context.tr('enter_vendor_name'),
                  border: const OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 16),
              Text(
                context.tr('business_name'),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: businessNameController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: context.tr('enter_business_name'),
                  border: const OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 16),
              _buildDetailItem(context.tr('phone_number'), vendorData?['phone'] ?? context.tr('not_available')),
              const SizedBox(height: 16),
              Text(
                context.tr('address'),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: addressController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: context.tr('enter_address'),
                  border: const OutlineInputBorder(),
                ),
                maxLines: 3,
                textCapitalization: TextCapitalization.words,
              ),
              if (latitude != null && longitude != null) ...[
                const SizedBox(height: 20),
                _buildLocationSection(
                  context: context,
                  vendorId: vendorId,
                  latitude: latitude,
                  longitude: longitude,
                  locationChangeStatus: locationChangeStatus,
                  onUpdated: onUpdated,
                ),
              ],
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (isSaving || !isDirty())
                      ? null
                      : () async {
                          setState(() => isSaving = true);
                          try {
                            final result = await VendorDataService.updateProfile(
                              name: nameController.text.trim(),
                              businessName: businessNameController.text.trim(),
                              address: addressController.text.trim(),
                            );

                            if (!context.mounted) return;

                            if (result['success']) {
                              await VendorDataService.clearCache();
                              await onUpdated();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(context.tr('business_details_updated')),
                                    backgroundColor: AppTheme.successGreen,
                                  ),
                                );
                                Navigator.pop(context);
                              }
                            } else {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(result['message'] ?? context.tr('failed_update_business_details')),
                                    backgroundColor: AppTheme.errorRed,
                                  ),
                                );
                              }
                              setState(() => isSaving = false);
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(context.tr('something_went_wrong')),
                                  backgroundColor: AppTheme.errorRed,
                                ),
                              );
                            }
                            setState(() => isSaving = false);
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    disabledBackgroundColor: AppTheme.mediumGray,
                  ),
                  child: isSaving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.white),
                        )
                      : Text(context.tr('save')),
                ),
              ),
              SizedBox(height: MediaQuery.of(context).padding.bottom),
            ],
          ),
        ),
      ),
    ),
  );
}

/// Shows the current pin on a static map preview, with an option to
/// propose a new location — which only takes effect once Can Can approves
/// it (see frontend/src/app/api/vendors/[id]/location-change). Does not
/// embed an interactive map widget (no maps SDK in this app) — opens the
/// device's map app for viewing, and a small lat/lng form for proposing.
Widget _buildLocationSection({
  required BuildContext context,
  required String? vendorId,
  required double latitude,
  required double longitude,
  required String? locationChangeStatus,
  required Future<void> Function() onUpdated,
}) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        context.tr('address'),
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
      ),
      const SizedBox(height: 8),
      Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => _openMap(latitude, longitude),
              icon: const Icon(Icons.map_outlined, size: 18),
              label: Text(context.tr('view_on_map')),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: (locationChangeStatus == 'pending' || vendorId == null)
                  ? null
                  : () => _showRequestLocationChangeDialog(context, vendorId, latitude, longitude, onUpdated),
              icon: const Icon(Icons.edit_location_alt_outlined, size: 18),
              label: Text(context.tr('request_location_change')),
            ),
          ),
        ],
      ),
      if (locationChangeStatus == 'pending') ...[
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppTheme.warningOrange.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              const Icon(Icons.hourglass_top, size: 16, color: AppTheme.warningOrange),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  context.tr('location_change_pending'),
                  style: const TextStyle(fontSize: 12, color: AppTheme.warningOrange),
                ),
              ),
            ],
          ),
        ),
      ],
    ],
  );
}

Future<void> _openMap(double latitude, double longitude) async {
  final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$latitude,$longitude');
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

void _showRequestLocationChangeDialog(
  BuildContext context,
  String vendorId,
  double currentLat,
  double currentLng,
  Future<void> Function() onUpdated,
) {
  final latController = TextEditingController(text: currentLat.toString());
  final lngController = TextEditingController(text: currentLng.toString());

  showDialog(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(context.tr('request_location_change')),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(context.tr('location_change_note'), style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          TextField(
            controller: latController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
            decoration: InputDecoration(labelText: context.tr('latitude'), border: const OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: lngController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
            decoration: InputDecoration(labelText: context.tr('longitude'), border: const OutlineInputBorder()),
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(context.tr('cancel'))),
        ElevatedButton(
          onPressed: () async {
            final lat = double.tryParse(latController.text.trim());
            final lng = double.tryParse(lngController.text.trim());
            if (lat == null || lng == null) return;

            final result = await VendorLocationApi().requestLocationChange(
              vendorId: vendorId,
              latitude: lat,
              longitude: lng,
            );
            if (!dialogContext.mounted) return;
            Navigator.pop(dialogContext);

            if (!context.mounted) return;
            if (result['success'] == true) {
              await VendorDataService.clearCache();
              await onUpdated();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(context.tr('location_change_requested')), backgroundColor: AppTheme.successGreen),
                );
              }
            } else {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(result['message'] ?? context.tr('failed_request_location_change')),
                    backgroundColor: AppTheme.errorRed,
                  ),
                );
              }
            }
          },
          child: Text(context.tr('confirm')),
        ),
      ],
    ),
  );
}

Widget _buildDetailItem(String label, String value) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    ),
  );
}
