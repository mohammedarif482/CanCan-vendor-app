'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playWaterDrop, playDing } from './SoundEngine';
import s from './WhatsAppSimulator.module.css';

interface Message {
    id: number;
    type: 'bot' | 'user';
    text: string;
}

interface ButtonOption {
    label: string;
    value: string;
}

interface Step {
    botMessage: string;
    buttons: ButtonOption[];
    userReply?: (choice: string) => string;
}

const STEPS: Step[] = [
    {
        botMessage: 'Welcome to Can Can! How can we help you today?',
        buttons: [
            { label: 'Order Water Cans', value: 'order' },
            { label: 'Track My Order', value: 'track' },
            { label: 'Reorder Previous', value: 'reorder' },
        ],
    },
    {
        botMessage: 'Choose your brand:',
        buttons: [
            { label: 'Bisleri 20L — ₹70', value: 'Bisleri 20L' },
            { label: 'Kinley 20L — ₹65', value: 'Kinley 20L' },
            { label: 'Local Brand — ₹50', value: 'Local Brand' },
        ],
    },
    {
        botMessage: 'How many cans do you need?',
        buttons: [
            { label: '1 Can', value: '1' },
            { label: '2 Cans', value: '2' },
            { label: '5 Cans', value: '5' },
        ],
    },
    {
        botMessage: 'When should we deliver?',
        buttons: [
            { label: 'Morning 8-10am', value: 'Morning 8-10am' },
            { label: 'Afternoon 12-2pm', value: 'Afternoon 12-2pm' },
            { label: 'Evening 5-7pm', value: 'Evening 5-7pm' },
        ],
    },
];

export default function WhatsAppSimulator({ soundEnabled }: { soundEnabled: boolean }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [choices, setChoices] = useState<Record<number, string>>({});
    const [isComplete, setIsComplete] = useState(false);
    const [started, setStarted] = useState(false);
    const [msgId, setMsgId] = useState(0);

    const addMessage = useCallback((type: 'bot' | 'user', text: string) => {
        setMsgId((prev) => {
            const id = prev + 1;
            setMessages((msgs) => [...msgs, { id, type, text }]);
            return id;
        });
    }, []);

    const startConversation = useCallback(() => {
        setStarted(true);
        setIsTyping(true);
        if (soundEnabled) playWaterDrop();
        setTimeout(() => {
            setIsTyping(false);
            addMessage('bot', STEPS[0].botMessage);
        }, 800);
    }, [addMessage, soundEnabled]);

    const handleChoice = useCallback(
        (choice: string, stepIndex: number) => {
            if (isTyping || isComplete) return;

            // User message
            addMessage('user', choice);
            if (soundEnabled) playWaterDrop();

            const newChoices = { ...choices, [stepIndex]: choice };
            setChoices(newChoices);

            const nextStep = stepIndex + 1;

            setIsTyping(true);

            setTimeout(() => {
                setIsTyping(false);

                if (nextStep < STEPS.length) {
                    addMessage('bot', STEPS[nextStep].botMessage);
                    setCurrentStep(nextStep);
                } else {
                    // Final confirmation
                    const brand = newChoices[1] || 'Bisleri 20L';
                    const qty = newChoices[2] || '2';
                    const time = newChoices[3] || 'Morning 8-10am';
                    const priceMap: Record<string, number> = { 'Bisleri 20L': 70, 'Kinley 20L': 65, 'Local Brand': 50 };
                    const price = (priceMap[brand] || 70) * parseInt(qty);

                    addMessage(
                        'bot',
                        `Order confirmed! ${qty}x ${brand} arriving at ${time}. Total: ₹${price}. Your nearest vendor has been notified.`
                    );
                    setIsComplete(true);
                    if (soundEnabled) playDing();
                }
            }, 700 + Math.random() * 500);
        },
        [addMessage, choices, isTyping, isComplete, soundEnabled]
    );

    const reset = useCallback(() => {
        setMessages([]);
        setCurrentStep(0);
        setChoices({});
        setIsComplete(false);
        setStarted(false);
        setMsgId(0);
    }, []);

    const showButtons = started && !isTyping && !isComplete;
    const step = STEPS[currentStep];

    return (
        <div className={s.phone}>
            <div className={s.notch} />
            <div className={s.statusBar}>
                <span className={s.statusTime}>9:41</span>
                <div className={s.statusIcons}>
                    <span className={s.signal} />
                    <span className={s.wifi} />
                    <span className={s.battery} />
                </div>
            </div>
            <div className={s.chatHeader}>
                <div className={s.avatar}>CC</div>
                <div>
                    <div className={s.chatName}>Can Can Water</div>
                    <div className={s.chatStatus}>online</div>
                </div>
            </div>

            <div className={s.screen}>
                {!started && (
                    <div className={s.startPrompt}>
                        <p>Try ordering water cans!</p>
                        <button className={s.startBtn} onClick={startConversation}>
                            Start Conversation
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            className={msg.type === 'bot' ? s.bubbleBot : s.bubbleUser}
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {msg.text}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        className={s.typing}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span /><span /><span />
                    </motion.div>
                )}

                {showButtons && step && (
                    <motion.div
                        className={s.buttons}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {step.buttons.map((btn) => (
                            <button
                                key={btn.value}
                                className={s.choiceBtn}
                                onClick={() => handleChoice(btn.label, currentStep)}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                {isComplete && (
                    <motion.button
                        className={s.resetBtn}
                        onClick={reset}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Try again
                    </motion.button>
                )}
            </div>
        </div>
    );
}
