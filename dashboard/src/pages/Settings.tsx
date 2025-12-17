import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderAlerts: true,
    paymentAlerts: true,
    systemAlerts: false,
  });
  const [systemSettings, setSystemSettings] = useState({
    autoAssignOrders: false,
    requireApproval: true,
    enableCustomerSignup: true,
    maintenanceMode: false,
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Can Can Water Delivery',
    email: 'support@cancan.com',
    phone: '+91-9876543210',
    address: '123 Main St, Mumbai, India 400001',
  });

  const handlePasswordChange = () => {
    // Handle password change logic here
    setPasswordDialogOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveSettings = () => {
    // Handle saving settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Profile Settings</Typography>
              </Box>
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2"><strong>Name:</strong> {user?.name || 'Admin User'}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {user?.email || 'admin@cancan.com'}</Typography>
                <Typography variant="body2"><strong>Role:</strong> {user?.role || 'Administrator'}</Typography>
                <Typography variant="body2"><strong>Last Login:</strong> {new Date().toLocaleDateString()}</Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setPasswordDialogOpen(true)}
                fullWidth
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Notification Settings</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="SMS Notifications" secondary="Receive SMS alerts" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.smsNotifications}
                      onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Push Notifications" secondary="Browser push notifications" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Order Alerts" secondary="New order notifications" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.orderAlerts}
                      onChange={(e) => setNotifications({...notifications, orderAlerts: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Payment Alerts" secondary="Payment status updates" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.paymentAlerts}
                      onChange={(e) => setNotifications({...notifications, paymentAlerts: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="System Alerts" secondary="System maintenance" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.systemAlerts}
                      onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">System Settings</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Auto-Assign Orders"
                    secondary="Automatically assign orders to vendors"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.autoAssignOrders}
                      onChange={(e) => setSystemSettings({...systemSettings, autoAssignOrders: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Require Approval"
                    secondary="Require manual approval for new vendors"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.requireApproval}
                      onChange={(e) => setSystemSettings({...systemSettings, requireApproval: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Customer Signup"
                    secondary="Allow customers to self-register"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.enableCustomerSignup}
                      onChange={(e) => setSystemSettings({...systemSettings, enableCustomerSignup: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Maintenance Mode"
                    secondary="Temporarily disable customer access"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Company Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Your account is protected with industry-standard encryption and security measures.
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Add an extra layer of security to your account
                    </Typography>
                    <Button variant="outlined" size="small">Enable 2FA</Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Session Management</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      View and manage active sessions
                    </Typography>
                    <Button variant="outlined" size="small">Manage Sessions</Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>API Keys</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Generate and manage API access keys
                    </Typography>
                    <Button variant="outlined" size="small">Manage Keys</Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Settings Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              size="large"
            >
              Save All Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordChange}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;