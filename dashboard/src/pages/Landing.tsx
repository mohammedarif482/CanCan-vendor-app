import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  useScrollTrigger,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fade,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AutoModeIcon from '@mui/icons-material/AutoMode';

const ElevationScroll = (props: { children: React.ReactElement }) => {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: {
      background: trigger ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      backdropFilter: trigger ? 'blur(10px)' : 'none',
      borderBottom: trigger ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
      transition: 'all 0.3s ease-in-out',
    }
  });
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          borderColor: 'primary.main'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'primary.50',
            color: 'primary.main',
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{title}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{description}</Typography>
      </CardContent>
    </Card>
  );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'How it Works', href: '#how' },
    { label: 'For Vendors', href: '#vendors' },
    { label: 'Technology', href: '#technology' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ my: 2 }}>
        <WaterDropIcon color="primary" fontSize="large" />
        <Typography variant="h6" sx={{ fontWeight: 900 }}>Can Can</Typography>
      </Stack>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemText primary={
              <Button href={item.href} sx={{ width: '100%', fontWeight: 700, color: 'text.primary' }}>
                {item.label}
              </Button>
            } />
          </ListItem>
        ))}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <Button fullWidth variant="contained" onClick={() => navigate('/portal/login')} sx={{ mx: 2, borderRadius: 2, py: 1.5 }}>
            Vendor Portal
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <ElevationScroll>
        <AppBar position="fixed" color="transparent" elevation={0}>
          <Toolbar sx={{ py: 1.5 }}>
            <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

              {/* Logo */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 0.5, display: 'flex' }}>
                  <WaterDropIcon sx={{ color: '#fff' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                  Can Can
                </Typography>
              </Stack>

              {/* Desktop Nav */}
              <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    href={item.href}
                    sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main', backgroundColor: 'transparent' } }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />
                <Button
                  variant="contained"
                  onClick={() => navigate('/portal/login')}
                  disableElevation
                  sx={{
                    borderRadius: 8,
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                >
                  Vendor Portal
                </Button>
              </Stack>

              {/* Mobile Nav Toggle */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' }, color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            </Container>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}
      >
        {drawer}
      </Drawer>

      <Box component="main">
        {/* HERO SECTION */}
        <Box
          sx={{
            pt: { xs: 16, md: 24 },
            pb: { xs: 8, md: 16 },
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Abstract background shapes */}
          <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in={isVisible} timeout={1000}>
              <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
                <Chip
                  label="Revolutionizing Local Delivery"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 3, fontWeight: 700, borderRadius: 2, border: '2px solid' }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '3rem', md: '5rem' },
                    lineHeight: 1.1,
                    letterSpacing: '-1.5px',
                    color: '#0f172a',
                    mb: 3
                  }}
                >
                  Water Delivery,<br />
                  <Box component="span" sx={{ color: 'primary.main' }}>Done Right.</Box>
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#475569',
                    mb: 5,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    px: { xs: 2, md: 6 }
                  }}
                >
                  The unified platform connecting customers to local vendors. Smart routing, automated WhatsApp ordering, and instant fulfillment.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    href="https://wa.me/919025320535?text=Hi"
                    target="_blank"
                    sx={{
                      borderRadius: 8,
                      fontWeight: 800,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 25px rgba(33, 150, 243, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(33, 150, 243, 0.6)',
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    Order via WhatsApp
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/portal/login')}
                    sx={{
                      borderRadius: 8,
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      borderWidth: '2px',
                      '&:hover': { borderWidth: '2px', backgroundColor: 'rgba(33, 150, 243, 0.05)' }
                    }}
                  >
                    Join as Vendor
                  </Button>
                </Stack>
              </Box>
            </Fade>

            {/* Dashboard Mockup Image goes here */}
            <Fade in={isVisible} timeout={2000}>
              <Box
                sx={{
                  mt: { xs: 8, md: 12 },
                  mx: 'auto',
                  maxWidth: 1000,
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(20px)',
                  p: 1
                }}
              >
                {/* Pseudo Mockup placeholder representing the impressive UI */}
                <Box sx={{ width: '100%', height: { xs: 200, sm: 400, md: 500 }, bgcolor: '#f1f5f9', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  <Stack spacing={2} alignItems="center" sx={{ color: '#94a3b8' }}>
                    <SpeedIcon sx={{ fontSize: 64 }} />
                    <Typography variant="h6" fontWeight={700}>Vendor Dashboard Previews Here</Typography>
                  </Stack>
                </Box>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* METRICS / LOGO BANNER */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 4, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-around" alignItems="center" spacing={4}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={900} color="primary.main">10k+</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Cans Delivered</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={900} color="primary.main">&lt; 3s</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Order Time</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={900} color="primary.main">50+</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Active Vendors</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={900} color="primary.main">99.9%</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Uptime</Typography>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* HOW IT WORKS SECTION */}
        <Box id="how" sx={{ py: { xs: 10, md: 15 }, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={10}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2 }}>ZERO FRICTION</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, color: '#0f172a' }}>
                How It Works
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', mt: 2, fontWeight: 400 }}>
                We've eliminated the need for apps. Customers order purely through automated WhatsApp conversational flows.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
              <FeatureCard
                icon={<QrCode2Icon fontSize="large" />}
                title="1. Scan & Start"
                description="Customers scan a vendor's unique QR code, instantly opening WhatsApp with a pre-filled greeting."
              />
              <FeatureCard
                icon={<PhoneIphoneIcon fontSize="large" />}
                title="2. Interactive Chat"
                description="Our automated bot provides interactive buttons to select water brands, quantities, and delivery times."
              />
              <FeatureCard
                icon={<LocalShippingIcon fontSize="large" />}
                title="3. Instant Dispatch"
                description="The order immediately alerts the local vendor on their portal, optimizing the delivery route for speed."
              />
            </Box>
          </Container>
        </Box>

        {/* FOR VENDORS SECTION */}
        <Box id="vendors" sx={{ py: { xs: 10, md: 15 }, bgcolor: '#f8fafc' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 6, md: 12 }, alignItems: 'center' }}>

              <Box>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2 }}>VENDOR EMPOWERMENT</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 3, color: '#0f172a', lineHeight: 1.2 }}>
                  A complete operational powerhouse.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Can Can isn't just an ordering tool. It's a full CRM, ERP, and logistics engine designed specifically for local water can distributors. Let us handle the tech while you scale your territory.
                </Typography>

                <Stack spacing={3}>
                  {[
                    { title: "Real-time Order Sync", desc: "WhatsApp orders appear in your dashboard instantly." },
                    { title: "Commission & Accounting", desc: "Automated tracking of driver earnings and cash flows." },
                    { title: "Inventory Forecasting", desc: "Never run out of empty cans with predictive alerts." }
                  ].map((item, i) => (
                    <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircleIcon color="success" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800} color="#0f172a">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/portal/login')}
                  mt={5}
                  sx={{ mt: 5, borderRadius: 8, fontWeight: 700, px: 4, py: 1.5 }}
                >
                  Access Portal
                </Button>
              </Box>

              <Box sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', inset: -20, background: 'linear-gradient(135deg, rgba(33,150,243,0.2) 0%, rgba(34,197,94,0.2) 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', zIndex: 0, filter: 'blur(30px)' }} />
                <Card elevation={10} sx={{ position: 'relative', zIndex: 1, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)' }}>
                  {/* Split feature grid graphic */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '1px', bgcolor: 'divider' }}>
                    <Box sx={{ p: 4, bgcolor: '#fff' }}>
                      <Typography variant="h4" fontWeight={900} color="primary">+45%</Typography>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Delivery Efficiency</Typography>
                    </Box>
                    <Box sx={{ p: 4, bgcolor: '#fff' }}>
                      <Typography variant="h4" fontWeight={900} color="primary">0</Typography>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Missed Orders</Typography>
                    </Box>
                    <Box sx={{ p: 4, bgcolor: '#fff' }}>
                      <Typography variant="h4" fontWeight={900} color="primary">Live</Typography>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">WhatsApp Sync</Typography>
                    </Box>
                    <Box sx={{ p: 4, bgcolor: '#fff' }}>
                      <Typography variant="h4" fontWeight={900} color="primary">24/7</Typography>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Automated Ops</Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>

            </Box>
          </Container>
        </Box>

        {/* TECHNOLOGY STACK / INVESTOR SECTION */}
        <Box id="technology" sx={{ py: { xs: 10, md: 15 }, bgcolor: '#0f172a', color: '#fff' }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={8}>
              <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: 2 }}>BUILT FOR SCALE</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>
                Enterprise-Grade Architecture
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
              <Box sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.03)' }}>
                <AutoModeIcon sx={{ fontSize: 40, color: '#38bdf8', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} mb={1}>Serverless Infrastructure</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Deploying on Vercel's global edge network guarantees sub-100ms response times for the WhatsApp hook, regardless of volume.
                </Typography>
              </Box>
              <Box sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.03)' }}>
                <VerifiedUserIcon sx={{ fontSize: 40, color: '#4ade80', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} mb={1}>PostgreSQL & Supabase</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  A robust, relational database backbone ensures complete ACID compliance for financial tracking and real-time portal syncing.
                </Typography>
              </Box>
              <Box sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.03)' }}>
                <NotificationsActiveIcon sx={{ fontSize: 40, color: '#fbbf24', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} mb={1}>Meta Graph API Integration</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Deep integration with the official WhatsApp Business API allows for secure, highly-scalable conversational commerce.
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

      </main>

      {/* FOOTER */}
      <Box component="footer" sx={{ bgcolor: '#fff', pt: 8, pb: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={4} mb={6}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Box sx={{ bgcolor: 'primary.main', borderRadius: 1.5, p: 0.5, display: 'flex' }}>
                  <WaterDropIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>Can Can</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300 }}>
                Revolutionizing local water delivery through conversational commerce and smart logistics.
              </Typography>
            </Box>

            <Stack direction="row" spacing={8}>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} mb={2} color="#0f172a">Product</Typography>
                <Stack spacing={1}>
                  <Link to="#how" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>How it Works</Link>
                  <Link to="#vendors" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>For Vendors</Link>
                  <Link to="/portal/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>Vendor Login</Link>
                </Stack>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} mb={2} color="#0f172a">Legal</Typography>
                <Stack spacing={1}>
                  <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy Policy</Link>
                  <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>Terms &amp; Conditions</Link>
                  <Link to="mailto:admin@cancanindia.com" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>Contact Support</Link>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          <Box sx={{ pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              &copy; {new Date().getFullYear()} Can Can. All rights reserved. Registered in India.
            </Typography>
            <Stack direction="row" spacing={2} mt={{ xs: 2, md: 0 }}>
              {/* Optional Social Icons could go here */}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Floating WhatsApp CTA */}
      <Box
        component="a"
        href="https://wa.me/919025320535?text=Hi%20Can%20Can%20Team%2C%20I%20want%20to%20order%20water%20cans"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#25D366',
          color: '#fff',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.5)',
          zIndex: 1000,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        }}
        aria-label="Message Can Can on WhatsApp"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.757-.866-2.03-.965-.273-.099-.472-.149-.672.15-.198.297-.768.965-.942 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.476-.884-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.672-1.612-.92-2.214-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.793.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.757-.718 2.006-1.411.248-.693.248-1.287.173-1.411-.074-.123-.272-.198-.57-.347z" />
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.373 0 .052 5.323.052 11.95c0 2.106.552 4.07 1.6 5.82L0 24l6.45-1.68a11.92 11.92 0 0 0 5.55 1.42c6.627 0 11.948-5.323 11.948-11.95 0-3.2-1.25-6.2-3.428-8.11z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Box>
    </Box>
  );
};

export default Landing;
