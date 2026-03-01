'use client';

import { useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import WhatsAppSimulator from '@/components/landing/WhatsAppSimulator';
import VendorSimulation from '@/components/landing/VendorSimulation';
import s from './landing.module.css';

// Lazy-load Three.js to avoid SSR and reduce initial bundle
const DeliveryScene = dynamic(() => import('@/components/landing/DeliveryScene'), {
  ssr: false,
  loading: () => null,
});

const WA_LINK =
  'https://wa.me/919025320535?text=Hi%20Can%20Can%2C%20I%20want%20to%20order%20water%20cans';

/* ---- SVG Icons ---- */
function IconWhatsApp({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.757-.866-2.03-.965-.273-.099-.472-.149-.672.15-.198.297-.768.965-.942 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.476-.884-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.672-1.612-.92-2.214-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.793.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.757-.718 2.006-1.411.248-.693.248-1.287.173-1.411-.074-.123-.272-.198-.57-.347z" />
      <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.373 0 .052 5.323.052 11.95c0 2.106.552 4.07 1.6 5.82L0 24l6.45-1.68a11.92 11.92 0 0 0 5.55 1.42c6.627 0 11.948-5.323 11.948-11.95 0-3.2-1.25-6.2-3.428-8.11z" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
function IconPackage() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconVolume() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
function IconVolumeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

/* ---- Helpers ---- */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
      className={s.counterValue}
    >
      {value}{suffix}
    </motion.span>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function LandingPage() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className={s.page}>
      {/* Sound Toggle */}
      <button
        className={s.soundToggle}
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? <IconVolume /> : <IconVolumeOff />}
      </button>

      {/* ===== NAV ===== */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/" className={s.brand}>
            <Image src="/cancan/cancan-logo.png" alt="Can Can" width={36} height={36} style={{ objectFit: 'contain' }} priority />
            <span className={s.brandText}>Can Can</span>
          </Link>
          <nav className={s.nav}>
            <a href="#order" className={s.navLink}>Try ordering</a>
            <a href="#vendors" className={s.navLink}>For Vendors</a>
            <a href="#how" className={s.navLink}>How it works</a>
            <a href="#contact" className={s.navLink}>Contact</a>
            <Link href="/portal/login" className={s.navCta}>Vendor Login</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== HERO with 3D Delivery Scene ===== */}
        <section ref={heroRef} className={s.hero}>
          <div className={s.heroInner}>
            <motion.div className={s.heroContent} style={{ y: heroY, opacity: heroOpacity }}>
              <motion.p className={s.heroLocation} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                Serving Chennai &amp; surrounding areas
              </motion.p>
              <motion.h1 className={s.heroTitle} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                Fresh water cans,<br /><span className={s.heroGradient}>delivered to your door.</span>
              </motion.h1>
              <motion.p className={s.heroDesc} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }}>
                Order purified drinking water through WhatsApp — no app to download, no account to create. Just tap, choose, and your water arrives.
              </motion.p>
              <motion.div className={s.heroActions} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                <a href={WA_LINK} className={s.btnPrimary} target="_blank" rel="noopener noreferrer">
                  <IconWhatsApp size={20} /> Order on WhatsApp
                </a>
                <a href="#order" className={s.btnOutline}>Try the demo below</a>
              </motion.div>
            </motion.div>

            <motion.div
              className={s.hero3D}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            >
              <Suspense fallback={null}>
                <DeliveryScene />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* ===== INTERACTIVE WHATSAPP DEMO (Moved Right Below Hero) ===== */}
        <section id="order" className={s.demoSection}>
          <div className={s.container}>
            <div className={s.demoGrid}>
              <Reveal>
                <div className={s.demoContent}>
                  <span className={s.overline}>Try it yourself</span>
                  <h2 className={s.sectionTitle}>Experience the ordering flow.</h2>
                  <p className={s.sectionDesc} style={{ textAlign: 'left', margin: '0 0 24px' }}>
                    This is exactly what your customers see. Tap the buttons to walk through
                    a real order — from greeting to confirmed delivery. No sign-ups, no downloads,
                    just WhatsApp.
                  </p>
                  <ul className={s.featureList}>
                    <li><IconBell /><div><strong>Instant notifications</strong><span>You get a WhatsApp confirmation the moment your order is placed</span></div></li>
                    <li><IconChat /><div><strong>One-tap reorder</strong><span>Your previous orders are remembered for quick reordering</span></div></li>
                    <li><IconShield /><div><strong>Verified brands only</strong><span>Bisleri, Kinley, and vetted local suppliers</span></div></li>
                  </ul>
                  <a href={WA_LINK} className={s.btnPrimary} target="_blank" rel="noopener noreferrer">
                    <IconWhatsApp size={18} /> Order for real
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className={s.demoPhone}>
                  <WhatsAppSimulator soundEnabled={soundEnabled} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== VENDOR SIMULATION (Moved Up) ===== */}
        <section id="vendors" className={s.vendorSection}>
          <div className={s.container}>
            <div className={s.vendorShowcase}>
              <Reveal>
                <div className={s.vendorLeft}>
                  <span className={s.overlineLight}>For vendors</span>
                  <h2 className={s.sectionTitleLight}>See orders roll in. Watch revenue grow.</h2>
                  <p className={s.sectionDescLight}>
                    This is a live simulation of the Can Can vendor dashboard. Real vendors see their
                    orders, delivery status, and daily collection exactly like this —
                    updated in real-time via WhatsApp integration.
                  </p>
                  <div className={s.vendorFeatures}>
                    {[
                      { icon: <IconBell />, title: 'Instant order alerts', desc: 'WhatsApp orders appear on your dashboard in real-time.' },
                      { icon: <IconBarChart />, title: 'Revenue tracking', desc: 'Daily earnings, commission payouts — all automated.' },
                      { icon: <IconPackage />, title: 'Inventory management', desc: 'Stock levels and low-inventory alerts at a glance.' },
                    ].map((f, i) => (
                      <Reveal key={f.title} delay={i * 0.08}>
                        <div className={s.vendorFeature}>
                          <div className={s.vendorFeatureIcon}>{f.icon}</div>
                          <div>
                            <strong>{f.title}</strong>
                            <span>{f.desc}</span>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                  <Link href="/portal/login" className={s.btnLight}>Access Vendor Portal</Link>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className={s.vendorRight}>
                  <VendorSimulation soundEnabled={soundEnabled} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== PROOF BAR (Moved Down) ===== */}
        <section className={s.proof}>
          <div className={s.proofInner}>
            {[
              { value: '10,000', suffix: '+', label: 'Cans delivered in Chennai' },
              { value: '50', suffix: '+', label: 'Local vendors' },
              { value: '3', suffix: 'sec', label: 'Average order time' },
              { value: '4.8', suffix: '/5', label: 'Customer satisfaction' },
            ].map((m) => (
              <div key={m.label} className={s.proofItem}>
                <Counter value={m.value} suffix={m.suffix} />
                <span className={s.proofLabel}>{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS (Moved Down) ===== */}
        <section id="how" className={s.howSection}>
          <div className={s.container}>
            <Reveal>
              <div className={s.sectionHead}>
                <span className={s.overline}>Ordering made simple</span>
                <h2 className={s.sectionTitle}>Three taps. That&apos;s it.</h2>
                <p className={s.sectionDesc}>No app to install. No forms to fill. Just open WhatsApp, tap a few buttons, and your water can is on its way.</p>
              </div>
            </Reveal>
            <div className={s.stepsGrid}>
              {[
                { num: '01', icon: <IconChat />, title: 'Say hi on WhatsApp', desc: 'Tap our WhatsApp link or scan the QR code at your local store. The conversation starts instantly.' },
                { num: '02', icon: <IconShield />, title: 'Pick your water', desc: 'Choose your preferred brand, quantity, and delivery time using interactive WhatsApp buttons.' },
                { num: '03', icon: <IconTruck />, title: 'Get it delivered', desc: 'Your nearest vendor receives the order instantly and delivers straight to your doorstep.' },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 0.12}>
                  <div className={s.stepCard}>
                    <div className={s.stepNum}>{step.num}</div>
                    <div className={s.stepIcon}>{step.icon}</div>
                    <h3 className={s.stepTitle}>{step.title}</h3>
                    <p className={s.stepDesc}>{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" className={s.contactSection}>
          <div className={s.container}>
            <Reveal>
              <div className={s.contactInner}>
                <div>
                  <h2 className={s.sectionTitle}>Get in touch</h2>
                  <p className={s.contactDesc}>Whether you want to order water, become a vendor partner, or just ask us something — we&apos;re always a message away.</p>
                  <div className={s.contactDetails}>
                    <p><strong>Email</strong><a href="mailto:admin@cancanindia.com">admin@cancanindia.com</a></p>
                    <p><strong>Phone</strong><a href="tel:+919025320535">+91 90253 20535</a></p>
                    <p><strong>Location</strong><span>Chennai, Tamil Nadu, India</span></p>
                  </div>
                </div>
                <div className={s.contactCta}>
                  <a href={WA_LINK} className={s.btnPrimary} target="_blank" rel="noopener noreferrer">
                    <IconWhatsApp size={20} /> Message us on WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <Image src="/cancan/cancan-logo.png" alt="Can Can" width={32} height={32} style={{ objectFit: 'contain' }} />
            <span className={s.brandText}>Can Can</span>
            <p className={s.footerTagline}>Chennai&apos;s simplest way to order drinking water.</p>
          </div>
          <div className={s.footerColumns}>
            <div>
              <h4 className={s.footerColTitle}>Product</h4>
              <a href="#how">How it Works</a>
              <a href="#order">Try Ordering</a>
              <a href="#vendors">For Vendors</a>
            </div>
            <div>
              <h4 className={s.footerColTitle}>Company</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms &amp; Conditions</Link>
              <a href="mailto:admin@cancanindia.com">Contact</a>
            </div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <small>© {new Date().getFullYear()} Can Can. All rights reserved. Sole proprietorship registered in India.</small>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a className={s.whatsappFab} href={WA_LINK} target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp">
        <IconWhatsApp size={28} />
      </a>
    </div>
  );
}
