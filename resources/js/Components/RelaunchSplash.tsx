import { useEffect, useMemo, useState } from 'react';

interface RelaunchSplashProps {
    onComplete: () => void;
}

const EXIT_START_MS = 1800;
const EXIT_MS = 360;

function playChime() {
    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const now = ctx.currentTime;

        const tone = (freq: number, start: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + duration + 0.02);
        };

        tone(932, now, 0.14);
        tone(1244, now + 0.08, 0.16);
    } catch {
        // Ignore audio errors.
    }
}

export default function RelaunchSplash({ onComplete }: RelaunchSplashProps) {
    const [isClosing, setIsClosing] = useState(false);

    const particles = useMemo(
        () =>
            Array.from({ length: 68 }, (_, index) => ({
                id: index,
                left: `${Math.random() * 100}%`,
                size: 4 + Math.random() * 9,
                delay: Math.random() * 0.8,
                duration: 1.5 + Math.random() * 1.8,
                rotate: Math.random() * 360,
                color: ['#86efac', '#22c55e', '#facc15', '#38bdf8', '#fb7185'][Math.floor(Math.random() * 5)],
            })),
        [],
    );

    useEffect(() => {
        const closeTimer = window.setTimeout(() => {
            setIsClosing(true);
            playChime();
        }, EXIT_START_MS);

        const doneTimer = window.setTimeout(() => {
            onComplete();
        }, EXIT_START_MS + EXIT_MS);

        return () => {
            window.clearTimeout(closeTimer);
            window.clearTimeout(doneTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[130] overflow-hidden transition-opacity duration-500 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <style>{`
                @keyframes relaunch-fall {
                    0% { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 0; }
                    12% { opacity: 1; }
                    100% { transform: translate3d(0,108vh,0) rotate(760deg); opacity: 0; }
                }
            `}</style>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {particles.map((particle) => (
                    <span
                        key={particle.id}
                        className="absolute top-[-8vh] rounded-sm"
                        style={{
                            left: particle.left,
                            width: `${particle.size}px`,
                            height: `${particle.size * 0.62}px`,
                            backgroundColor: particle.color,
                            transform: `rotate(${particle.rotate}deg)`,
                            animation: `relaunch-fall ${particle.duration}s linear ${particle.delay}s forwards`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
