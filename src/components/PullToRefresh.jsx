import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

const PULL_THRESHOLD = 80;

export default function PullToRefresh({ children, onRefresh }) {
    const [pullChange, setPullChange] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [startPoint, setStartPoint] = useState(0);
    const containerRef = useRef(null);

    const pullDown = onRefresh || (() => window.location.reload());

    useEffect(() => {
        const handleStart = (y) => {
            const scrollContainer = containerRef.current;
            if (scrollContainer && scrollContainer.scrollTop === 0) {
                setStartPoint(y);
            } else if (window.scrollY === 0) {
                setStartPoint(y);
            } else {
                setStartPoint(0);
            }
        };

        const handleMove = (y, e) => {
            if (startPoint === 0 || refreshing) return;

            const change = y - startPoint;

            if (change > 0) {
                const scrollContainer = containerRef.current;
                const isAtTop = scrollContainer ? scrollContainer.scrollTop === 0 : window.scrollY === 0;

                if (isAtTop) {
                    setPullChange(change);
                    if (e.cancelable) e.preventDefault();
                }
            }
        };

        const handleEnd = () => {
            if (pullChange > PULL_THRESHOLD) {
                setRefreshing(true);
                setPullChange(PULL_THRESHOLD);

                setTimeout(async () => {
                    await pullDown();
                    setRefreshing(false);
                    setPullChange(0);
                }, 800);
            } else {
                setPullChange(0);
            }
            setStartPoint(0);
        };

        // Touch handlers
        const onTouchStart = (e) => handleStart(e.targetTouches[0].screenY);
        const onTouchMove = (e) => handleMove(e.targetTouches[0].screenY, e);
        const onTouchEnd = () => handleEnd();

        const element = containerRef.current;
        if (!element) return;

        // Add all listeners
        element.addEventListener('touchstart', onTouchStart, { passive: false });
        element.addEventListener('touchmove', onTouchMove, { passive: false });
        element.addEventListener('touchend', onTouchEnd);

        return () => {
            element.removeEventListener('touchstart', onTouchStart);
            element.removeEventListener('touchmove', onTouchMove);
            element.removeEventListener('touchend', onTouchEnd);
        };
    }, [startPoint, pullChange, refreshing, pullDown]);

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-y-auto overscroll-behavior-y-contain">
            {/* Visual Indicator */}
            <div
                className={clsx(
                    "absolute top-0 left-0 right-0 flex justify-center items-center transition-transform duration-200 pointer-events-none z-50",
                    pullChange > 0 ? "opacity-100" : "opacity-0"
                )}
                style={{
                    height: `${PULL_THRESHOLD}px`,
                    transform: `translateY(${Math.min(pullChange, PULL_THRESHOLD + 40) - PULL_THRESHOLD}px)`
                }}
            >
                <div className={clsx(
                    "bg-white shadow-lg rounded-full p-3 border border-gray-100",
                    refreshing ? "animate-spin" : ""
                )}>
                    <RefreshCw
                        className="h-5 w-5 text-blue-600"
                        style={{
                            transform: !refreshing ? `rotate(${pullChange * 3}deg)` : 'none'
                        }}
                    />
                </div>
            </div>

            {/* Content Container */}
            <div
                className="w-full transition-transform duration-200"
                style={{
                    transform: `translateY(${refreshing ? PULL_THRESHOLD / 2 : Math.min(pullChange / 2.5, PULL_THRESHOLD / 2)}px)`
                }}
            >
                {children}
            </div>
        </div>
    );
}
