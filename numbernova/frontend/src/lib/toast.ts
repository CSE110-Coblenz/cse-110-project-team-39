import Toastify from 'toastify-js';

type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Creates and displays a toast notification
 * @param message - The message to display
 * @param type - The type of toast (success, error, warning, info)
 * @param duration - How long to show the toast in milliseconds
 */
export function createNotification(message: string, type: ToastType = 'info', duration: number = 1500): void {
    const backgroundColor = getToastColor(type);
    const textColor = '#ffffff';

    Toastify({
        text: message,
        duration: duration,
        gravity: "top", // top or bottom
        position: "center", // left, center or right
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: backgroundColor,
            color: textColor,
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '16px',
            fontFamily: 'Jersey 10, Arial, sans-serif',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
            zIndex: '10000'
        },
    }).showToast();
}


function getToastColor(type: ToastType): string {
    switch (type) {
        case 'success':
            return 'linear-gradient(to right, #10b981, #059669)'; // Green gradient
        case 'error':
            return 'linear-gradient(to right, #ef4444, #dc2626)'; // Red gradient
        case 'warning':
            return 'linear-gradient(to right, #f59e0b, #d97706)'; // Orange gradient
        case 'info':
            return 'linear-gradient(to right, #3b82f6, #2563eb)'; // Blue gradient
        default:
            return 'linear-gradient(to right, #3b82f6, #2563eb)'; // Default to blue

    }
}