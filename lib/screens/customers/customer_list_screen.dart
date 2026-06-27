import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/customer_service.dart';
import '../../utils/localization_extension.dart';

/// Customer Database — every customer linked to this vendor, with delivery
/// details (floor, lift access, deposit amount) editable inline, and a
/// search bar filtering by name or phone number.
class CustomerListScreen extends StatefulWidget {
  const CustomerListScreen({super.key});

  @override
  State<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends State<CustomerListScreen> {
  final _customerService = CustomerService();
  final _searchController = TextEditingController();
  bool _isLoading = true;
  List<VendorCustomer> _customers = [];

  @override
  void initState() {
    super.initState();
    _load();
    _searchController.addListener(() => _load(searchQuery: _searchController.text));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load({String? searchQuery}) async {
    setState(() => _isLoading = true);
    final customers = await _customerService.getCustomers(searchQuery: searchQuery);
    if (!mounted) return;
    setState(() {
      _customers = customers;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('customers_title'))),
      body: Column(
        children: [
          Padding(
            padding: AppTheme.screenPaddingHorizontal,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: context.tr('search_name_or_number'),
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(height: AppTheme.spacingM),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _customers.isEmpty
                    ? Center(
                        child: Text(
                          context.tr('no_customers_found'),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.textSecondary),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          padding: AppTheme.screenPaddingHorizontal,
                          itemCount: _customers.length,
                          itemBuilder: (context, index) => _buildCustomerCard(_customers[index]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerCard(VendorCustomer customer) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.spacingM),
      padding: const EdgeInsets.all(AppTheme.spacingL),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.mediumGray),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(customer.name, style: Theme.of(context).textTheme.titleMedium),
              ),
              IconButton(
                icon: const Icon(Icons.edit_outlined, size: 20),
                onPressed: () => _showEditDialog(customer),
              ),
            ],
          ),
          Text(customer.phone, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary)),
          const SizedBox(height: AppTheme.spacingS),
          Text(customer.address, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: AppTheme.spacingS),
          Wrap(
            spacing: AppTheme.spacingS,
            runSpacing: AppTheme.spacingXS,
            children: [
              if (customer.floor != null && customer.floor!.isNotEmpty)
                _buildChip('${context.tr('floor')}: ${customer.floor}'),
              _buildChip(customer.hasLift == true ? context.tr('has_lift') : context.tr('no_lift')),
              if (customer.depositAmount > 0)
                _buildChip('${context.tr('deposit_amount')}: Rs. ${customer.depositAmount.toStringAsFixed(0)}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.lightGray,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12)),
    );
  }

  void _showEditDialog(VendorCustomer customer) {
    final floorController = TextEditingController(text: customer.floor ?? '');
    final depositController = TextEditingController(
      text: customer.depositAmount > 0 ? customer.depositAmount.toStringAsFixed(0) : '',
    );
    bool hasLift = customer.hasLift ?? false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(context.tr('edit_delivery_details')),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: floorController,
                decoration: InputDecoration(labelText: context.tr('floor'), border: const OutlineInputBorder()),
              ),
              const SizedBox(height: AppTheme.spacingM),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(context.tr('lift')),
                value: hasLift,
                onChanged: (v) => setDialogState(() => hasLift = v),
              ),
              const SizedBox(height: AppTheme.spacingM),
              TextField(
                controller: depositController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration:
                    InputDecoration(labelText: context.tr('deposit_amount'), border: const OutlineInputBorder(), prefixText: 'Rs. '),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: Text(context.tr('cancel'))),
            ElevatedButton(
              onPressed: () async {
                final result = await _customerService.updateCustomerDeliveryDetails(
                  customerId: customer.id,
                  floor: floorController.text.trim(),
                  hasLift: hasLift,
                  depositAmount: double.tryParse(depositController.text.trim()) ?? 0.0,
                );
                if (!context.mounted) return;
                Navigator.pop(context);
                if (result['success'] == true) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(context.tr('delivery_details_updated')), backgroundColor: AppTheme.successGreen),
                  );
                  _load(searchQuery: _searchController.text);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(result['message'] ?? context.tr('failed_update_customer')),
                      backgroundColor: AppTheme.errorRed,
                    ),
                  );
                }
              },
              child: Text(context.tr('save')),
            ),
          ],
        ),
      ),
    );
  }
}
