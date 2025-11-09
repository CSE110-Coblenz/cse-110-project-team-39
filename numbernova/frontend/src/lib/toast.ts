export const createNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    console.log(`[${type.toUpperCase()}]: ${message}`);
    
    alert(`${type.toUpperCase()}: ${message}`);
};