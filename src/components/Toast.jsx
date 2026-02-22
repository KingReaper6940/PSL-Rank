import { useEffect, useState } from 'react'

export default function Toast({ type = 'success', message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="toast-container">
            <div className={`toast ${type}`}>
                <span>{type === 'success' ? '🏆' : '❌'}</span>
                <span>{message}</span>
            </div>
        </div>
    );
}
