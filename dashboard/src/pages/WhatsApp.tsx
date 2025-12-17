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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchWhatsAppMessages, fetchWhatsAppOrders } from '../store/whatsappSlice';
import { WhatsAppMessage, WhatsAppOrder } from '../types';

const WhatsApp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, orders, config, isLoading, error } = useSelector((state: RootState) => state.whatsapp);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tab, setTab] = useState<'messages' | 'orders'>('messages');
  const [messageFilter, setMessageFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: '',
    message: '',
  });

  useEffect(() => {
    if (tab === 'messages') {
      dispatch(fetchWhatsAppMessages({
        page: page + 1,
        limit: rowsPerPage,
        direction: messageFilter !== 'all' ? messageFilter : undefined,
      }));
    } else {
      dispatch(fetchWhatsAppOrders({
        page: page + 1,
        limit: rowsPerPage,
        status: orderFilter !== 'all' ? orderFilter : undefined,
      }));
    }
  }, [dispatch, tab, page, rowsPerPage, messageFilter, orderFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendMessage = () => {
    // Handle sending message logic here
    setSendDialogOpen(false);
    setSendForm({ to: '', message: '' });
  };

  const handleViewMessage = (message: WhatsAppMessage) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'delivered': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalMessages = messages.length;
  const todayMessages = messages.filter(msg =>
    new Date(msg.created_at).toDateString() === new Date().toDateString()
  ).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          WhatsApp Integration
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        WhatsApp Integration
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WhatsAppIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    API Status
                  </Typography>
                  <Typography variant="h6">
                    {config?.connected ? (
                      <Chip label="Connected" color="success" size="small" />
                    ) : (
                      <Chip label="Disconnected" color="error" size="small" />
                    )}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MessageIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Messages
                  </Typography>
                  <Typography variant="h4">{totalMessages}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Today's Messages
                  </Typography>
                  <Typography variant="h4">{todayMessages}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    WhatsApp Orders
                  </Typography>
                  <Typography variant="h4">{pendingOrders}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Button
              variant={tab === 'messages' ? 'contained' : 'outlined'}
              onClick={() => setTab('messages')}
              sx={{ mr: 2 }}
            >
              Messages
            </Button>
            <Button
              variant={tab === 'orders' ? 'contained' : 'outlined'}
              onClick={() => setTab('orders')}
              sx={{ mr: 2 }}
            >
              WhatsApp Orders
            </Button>
            <Divider orientation="vertical" flexItem />
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={() => setSendDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Send Message
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setConfigDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Configuration
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Messages Tab */}
      {tab === 'messages' && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Direction</InputLabel>
                <Select
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                  label="Direction"
                >
                  <MenuItem value="all">All Messages</MenuItem>
                  <MenuItem value="inbound">Inbound</MenuItem>
                  <MenuItem value="outbound">Outbound</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              {tab === 'messages' ? (
                <TableRow>
                  <TableCell>Phone</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={tab === 'messages' ? 6 : 8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                (tab === 'messages' ? messages : orders).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tab === 'messages' ? 6 : 8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No {tab === 'messages' ? 'messages' : 'orders'} found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (tab === 'messages' ? messages : orders).map((item) => (
                    <TableRow key={item.id} hover>
                      {tab === 'messages' ? (
                        <>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {(item as WhatsAppMessage).phone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(item as WhatsAppMessage).direction}
                              color={(item as WhatsAppMessage).direction === 'inbound' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {(item as WhatsAppMessage).message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(item as WhatsAppMessage).status}
                              color={getStatusColor((item as WhatsAppMessage).status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate((item as WhatsAppMessage).created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleViewMessage(item as WhatsAppMessage)}
                              title="View Details"
                            >
                              <MessageIcon />
                            </IconButton>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              #{(item as WhatsAppOrder).order_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(item as WhatsAppOrder).customer_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(item as WhatsAppOrder).phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(item as WhatsAppOrder).items?.length || 0} items
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              ₹{(item as WhatsAppOrder).total_amount || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(item as WhatsAppOrder).status}
                              color={getStatusColor((item as WhatsAppOrder).status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate((item as WhatsAppOrder).created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">
                              Process
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )
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

      {/* Send Message Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send WhatsApp Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Phone Number"
            value={sendForm.to}
            onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
            sx={{ mt: 2 }}
            placeholder="+919876543210"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={sendForm.message}
            onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
            sx={{ mt: 2 }}
            placeholder="Type your message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendMessage}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>WhatsApp Configuration</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Switch checked={config?.webhook_enabled || false} />}
            label="Webhook Enabled"
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Webhook URL"
            value={config?.webhook_url || ''}
            sx={{ mt: 2 }}
            placeholder="https://your-server.com/webhook"
          />
          <TextField
            fullWidth
            label="Access Token"
            type="password"
            value={config?.access_token || ''}
            sx={{ mt: 2 }}
            placeholder="Enter WhatsApp API access token"
          />
          <TextField
            fullWidth
            label="Phone Number ID"
            value={config?.phone_number_id || ''}
            sx={{ mt: 2 }}
            placeholder="Enter WhatsApp phone number ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Configuration</Button>
        </DialogActions>
      </Dialog>

      {/* Message Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Message Details</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedMessage.phone}</Typography>
                  <Typography variant="body2"><strong>Direction:</strong> {selectedMessage.direction}</Typography>
                  <Typography variant="body2"><strong>Message:</strong> {selectedMessage.message}</Typography>
                  <Typography variant="body2"><strong>Status:</strong>
                    <Chip
                      label={selectedMessage.status}
                      color={getStatusColor(selectedMessage.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2"><strong>Message ID:</strong> {selectedMessage.whatsapp_message_id}</Typography>
                  <Typography variant="body2"><strong>Sent At:</strong> {formatDate(selectedMessage.created_at)}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsApp;