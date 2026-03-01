'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playKaChing } from './SoundEngine';
import s from './VendorSimulation.module.css';

interface Order {
    id: number;
    customer: string;
    brand: string;
    qty: number;
    area: string;
    amount: number;
    time: string;
}

const CUSTOMERS = [
    'Priya S.', 'Karthik R.', 'Lakshmi V.', 'Arun K.',
    'Deepa M.', 'Vijay P.', 'Meena G.', 'Suresh N.',
    'Kavitha T.', 'Raj B.', 'Anitha L.', 'Kumar D.',
];
const BRANDS = ['Bisleri 20L', 'Kinley 20L', 'Local Brand'];
const AREAS = [
    'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery',
    'Porur', 'Tambaram', 'Chromepet', 'Guindy',
    'Mylapore', 'Besant Nagar', 'Kodambakkam', 'Ashok Nagar',
];
const PRICES: Record<string, number> = { 'Bisleri 20L': 70, 'Kinley 20L': 65, 'Local Brand': 50 };

function randomOrder(id: number): Order {
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const qty = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 2 : 1;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    return {
        id,
        customer: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
        brand,
        qty,
        area: AREAS[Math.floor(Math.random() * AREAS.length)],
        amount: PRICES[brand] * qty,
        time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
    };
}

/** Animated INR counter with realistic ticking */
function INRCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const start = display;
        const diff = value - start;
        if (diff === 0) return;

        const duration = 600;
        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + diff * ease));
            if (progress < 1) {
                animRef.current = requestAnimationFrame(tick);
            }
        };

        animRef.current = requestAnimationFrame(tick);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <span className={s.inrValue}>
            ₹{display.toLocaleString('en-IN')}
        </span>
    );
}

export default function VendorSimulation({ soundEnabled }: { soundEnabled: boolean }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const idRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const addOrder = useCallback(() => {
        idRef.current += 1;
        const order = randomOrder(idRef.current);
        setOrders((prev) => [order, ...prev].slice(0, 6));
        setTotal((prev) => prev + order.amount);
        setOrderCount((prev) => prev + 1);
        if (soundEnabled) playKaChing();
    }, [soundEnabled]);

    useEffect(() => {
        // Start with 2 orders
        setTimeout(() => addOrder(), 500);
        setTimeout(() => addOrder(), 1200);

        // Then every 3-5 seconds
        intervalRef.current = setInterval(() => {
            addOrder();
        }, 3000 + Math.random() * 2000);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={s.dashboard}>
            {/* Header */}
            <div className={s.dashHeader}>
                <div className={s.dashTitle}>
                    <div className={s.dashDot} />
                    Vendor Dashboard — Live
                </div>
                <div className={s.dashSubtitle}>Simulation of real vendor experience</div>
            </div>

            {/* Stats Row */}
            <div className={s.statsRow}>
                <div className={s.statBox}>
                    <span className={s.statLabel}>Today&apos;s Collection</span>
                    <INRCounter value={total} />
                </div>
                <div className={s.statBox}>
                    <span className={s.statLabel}>Orders</span>
                    <motion.span
                        className={s.statNumber}
                        key={orderCount}
                        initial={{ scale: 1.3, color: '#22c55e' }}
                        animate={{ scale: 1, color: '#f8fafc' }}
                        transition={{ duration: 0.4 }}
                    >
                        {orderCount}
                    </motion.span>
                </div>
                <div className={s.statBox}>
                    <span className={s.statLabel}>Avg Order</span>
                    <span className={s.statNumber}>
                        ₹{orderCount > 0 ? Math.round(total / orderCount) : 0}
                    </span>
                </div>
            </div>

            {/* Order Feed */}
            <div className={s.feed}>
                <div className={s.feedHeader}>Recent Orders</div>
                <div className={s.feedList}>
                    <AnimatePresence mode="popLayout">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                className={s.orderRow}
                                initial={{ opacity: 0, x: -30, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                layout
                            >
                                <div className={s.orderLeft}>
                                    <span className={s.orderCustomer}>{order.customer}</span>
                                    <span className={s.orderDetail}>
                                        {order.qty}x {order.brand} · {order.area}
                                    </span>
                                </div>
                                <div className={s.orderRight}>
                                    <span className={s.orderAmount}>₹{order.amount}</span>
                                    <span className={s.orderTime}>{order.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
