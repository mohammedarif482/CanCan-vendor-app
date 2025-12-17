import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCommissions } from '../store/commissionSlice';
import { CommissionRecord } from '../types';

const Commissions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { commissions, pagination, stats, isLoading, error } = useSelector((state: RootState) => state.commissions);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedCommission, setSelectedCommission] = useState<CommissionRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCommissions({
      page: page + 1,
      limit: rowsPerPage,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      vendor_id: vendorFilter !== 'all' ? vendorFilter : undefined,
    }));
  }, [dispatch, page, rowsPerPage, statusFilter, vendorFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCommission = (commission: CommissionRecord) => {
    setSelectedCommission(commission);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPending = stats?.totalPending || 0;
  const totalPaid = stats?.totalPaid || 0;
  const totalUnpaid = stats?.totalUnpaid || 0;
  const totalEarnings = stats?.totalEarnings || 0;

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Commission Tracking
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Commission Tracking
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Earnings
                  </Typography>
                  <Typography variant="h4">{formatCurrency(totalEarnings)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Paid Commissions
                  </Typography>
                  <Typography variant="h4">{formatCurrency(totalPaid)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PendingIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Pending Payment
                  </Typography>
                  <Typography variant="h4">{formatCurrency(totalPending)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalanceIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Unpaid Commissions
                  </Typography>
                  <Typography variant="h4">{formatCurrency(totalUnpaid)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Progress Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Commission Payment Status</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <LinearProgress
              variant="determinate"
              value={totalEarnings > 0 ? (totalPaid / totalEarnings) * 100 : 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {totalEarnings > 0 ? Math.round((totalPaid / totalEarnings) * 100) : 0}% Paid
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={4}>
            <Typography variant="caption" color="success.main">
              Paid: {formatCurrency(totalPaid)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="warning.main">
              Pending: {formatCurrency(totalPending)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="error.main">
              Unpaid: {formatCurrency(totalUnpaid)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Vendor</InputLabel>
              <Select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                label="Vendor"
              >
                <MenuItem value="all">All Vendors</MenuItem>
                <MenuItem value="vendor1">Vendor 1</MenuItem>
                <MenuItem value="vendor2">Vendor 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="outlined">Export CSV</Button>
              <Button variant="contained">Process Payments</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Commission ID</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Commission Amount</TableCell>
                <TableCell>Commission Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No commission records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((commission) => (
                  <TableRow key={commission.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        #{commission.id?.slice(0, 8) || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {commission.vendor?.name || 'Unknown Vendor'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {commission.vendor?.phone || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        #{commission.order_id?.slice(0, 8) || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        {formatCurrency(commission.commission_amount || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {commission.commission_rate || 0}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={commission.status}
                        color={getStatusColor(commission.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {commission.order_date ? formatDate(commission.order_date) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {commission.created_at ? formatDate(commission.created_at) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewCommission(commission)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Commission Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Commission Details</DialogTitle>
        <DialogContent>
          {selectedCommission && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2"><strong>Commission ID:</strong> #{selectedCommission.id}</Typography>
                  <Typography variant="body2"><strong>Order ID:</strong> #{selectedCommission.order_id}</Typography>
                  <Typography variant="body2"><strong>Vendor:</strong> {selectedCommission.vendor?.name}</Typography>
                  <Typography variant="body2"><strong>Commission Amount:</strong> {formatCurrency(selectedCommission.commission_amount || 0)}</Typography>
                  <Typography variant="body2"><strong>Commission Rate:</strong> {selectedCommission.commission_rate}%</Typography>
                  <Typography variant="body2"><strong>Status:</strong>
                    <Chip
                      label={selectedCommission.status}
                      color={getStatusColor(selectedCommission.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2"><strong>Order Total:</strong> {formatCurrency(selectedCommission.order_total || 0)}</Typography>
                  <Typography variant="body2"><strong>Order Date:</strong> {selectedCommission.order_date ? formatDate(selectedCommission.order_date) : 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Created:</strong> {selectedCommission.created_at ? formatDate(selectedCommission.created_at) : 'N/A'}</Typography>
                  {selectedCommission.paid_at && (
                    <Typography variant="body2"><strong>Paid On:</strong> {formatDate(selectedCommission.paid_at)}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedCommission?.status === 'pending' && (
            <Button variant="contained" color="primary">
              Mark as Paid
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Commissions;