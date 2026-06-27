import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../services/analytics_service.dart';
import '../../utils/localization_extension.dart';

/// Analytics Screen — cans sold, earnings, and new customers over the last
/// 7 days. Replaces the old home-screen "Earnings" card, which only showed
/// a single day's pending-order total.
class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final _analyticsService = AnalyticsService();
  bool _isLoading = true;
  List<DayAnalytics> _days = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final days = await _analyticsService.getLastNDaysSummary(days: 7);
    if (!mounted) return;
    setState(() {
      _days = days;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final totalCans = _days.fold<int>(0, (sum, d) => sum + d.cansSold);
    final totalEarnings = _days.fold<double>(0, (sum, d) => sum + d.earnings);
    final totalNewCustomers = _days.fold<int>(0, (sum, d) => sum + d.newCustomers);
    final maxCans = _days.isEmpty ? 1 : _days.map((d) => d.cansSold).reduce((a, b) => a > b ? a : b);

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('analytics'))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: AppTheme.screenPaddingHorizontal,
                children: [
                  const SizedBox(height: AppTheme.spacingL),
                  Text(
                    context.tr('last_7_days'),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                  ),
                  const SizedBox(height: AppTheme.spacingM),
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatCard(
                          context,
                          icon: Icons.water_drop_rounded,
                          value: '$totalCans',
                          label: context.tr('cans_sold'),
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacingM),
                      Expanded(
                        child: _buildStatCard(
                          context,
                          icon: Icons.payments_outlined,
                          value: 'Rs. ${totalEarnings.toStringAsFixed(0)}',
                          label: context.tr('total_earnings'),
                          color: AppTheme.successGreen,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacingM),
                  _buildStatCard(
                    context,
                    icon: Icons.person_add_alt_1_rounded,
                    value: '$totalNewCustomers',
                    label: context.tr('new_customers'),
                    color: AppTheme.warningOrange,
                    fullWidth: true,
                  ),
                  const SizedBox(height: AppTheme.spacingXXL),
                  Text(
                    context.tr('cans_sold'),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: AppTheme.spacingM),
                  ..._days.map((day) => _buildDayRow(context, day, maxCans)),
                  const SizedBox(height: AppTheme.spacingXXL),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String value,
    required String label,
    required Color color,
    bool fullWidth = false,
  }) {
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: AppTheme.paddingL,
      constraints: const BoxConstraints(minHeight: 96),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: AppTheme.white, size: 22),
          ),
          const SizedBox(width: AppTheme.spacingM),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDayRow(BuildContext context, DayAnalytics day, int maxCans) {
    final fraction = maxCans == 0 ? 0.0 : day.cansSold / maxCans;
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacingM),
      child: Row(
        children: [
          SizedBox(
            width: 56,
            child: Text(
              DateFormat('d MMM').format(day.date),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: fraction.clamp(0.0, 1.0),
                minHeight: 14,
                backgroundColor: AppTheme.lightGray,
                color: AppTheme.primaryBlue,
              ),
            ),
          ),
          const SizedBox(width: AppTheme.spacingS),
          SizedBox(
            width: 36,
            child: Text(
              '${day.cansSold}',
              textAlign: TextAlign.end,
              style: Theme.of(context).textTheme.titleSmall,
            ),
          ),
        ],
      ),
    );
  }
}
