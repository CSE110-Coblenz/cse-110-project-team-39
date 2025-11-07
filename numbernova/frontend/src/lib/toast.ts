import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../constants';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    group?: Konva.Group;
    timeoutId?: NodeJS.Timeout;
}

class ToastManager {
    private static instance: ToastManager;
    private toasts: Toast[] = [];
    private layer: Konva.Layer | null = null;
    private container: Konva.Group | null = null;

    private constructor() {}

    static getInstance(): ToastManager {
        if (!ToastManager.instance) {
            ToastManager.instance = new ToastManager();
        }
        return ToastManager.instance;
    }

    private ensureLayer(): void {
        // Get the current stage
        const stage = Konva.stages[0];
        if (!stage) return;

        // Check if our layer still exists and is attached to the stage
        if (!this.layer || !this.layer.getParent()) {
            // Clear any orphaned toasts and their timeouts
            this.toasts.forEach(toast => {
                if (toast.timeoutId) {
                    clearTimeout(toast.timeoutId);
                }
            });
            this.toasts = [];

            // Create a new layer for toasts
            this.layer = new Konva.Layer();
            stage.add(this.layer);

            // Create container group for all toasts
            this.container = new Konva.Group({
                x: DIMENSIONS.width / 2,
                y: 20
            });
            this.layer.add(this.container);
        }

        // Make sure the toast layer is on top
        this.layer.moveToTop();
    }

    private getToastColor(type: ToastType): string {
        switch (type) {
            case 'success':
                return '#4ade80';
            case 'error':
                return COLORS.error;
            case 'warning':
                return '#fbbf24';
            case 'info':
                return '#60a5fa';
            default:
                return COLORS.primary;
        }
    }

    private getToastIcon(type: ToastType): string {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✗';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '';
        }
    }

    private createToastElement(toast: Toast): Konva.Group {
        const group = new Konva.Group({
            x: -200,
            y: -100, // Start off-screen
            opacity: 0
        });

        const backgroundColor = this.getToastColor(toast.type);

        // Background rectangle
        const background = new Konva.Rect({
            width: 400,
            height: 60,
            fill: backgroundColor,
            cornerRadius: 10,
            shadowColor: 'black',
            shadowBlur: 15,
            shadowOffset: { x: 0, y: 5 },
            shadowOpacity: 0.3
        });

        // Icon background circle
        const iconBg = new Konva.Circle({
            x: 30,
            y: 30,
            radius: 18,
            fill: 'rgba(255, 255, 255, 0.2)'
        });

        // Icon text
        const icon = new Konva.Text({
            x: 30,
            y: 22,
            text: this.getToastIcon(toast.type),
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            offsetX: 5
        });

        // Message text
        const message = new Konva.Text({
            x: 65,
            y: 20,
            width: 320,
            text: toast.message,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'left'
        });

        group.add(background);
        group.add(iconBg);
        group.add(icon);
        group.add(message);

        return group;
    }

    private repositionToasts(): void {
        this.toasts.forEach((toast, index) => {
            // Only animate if the group exists and is in a layer
            if (toast.group && toast.group.getLayer()) {
                const targetY = index * 70;
                new Konva.Tween({
                    node: toast.group,
                    duration: 0.3,
                    y: targetY,
                    easing: Konva.Easings.EaseOut
                }).play();
            }
        });
    }

    public show(message: string, type: ToastType = 'info', duration: number = 3000): void {
        this.ensureLayer();
        if (!this.container || !this.layer) return;

        const toast: Toast = {
            id: Date.now().toString(),
            message,
            type,
            duration
        };

        const toastGroup = this.createToastElement(toast);
        toast.group = toastGroup;

        this.container.add(toastGroup);
        this.toasts.push(toast);

        // Animate in
        new Konva.Tween({
            node: toastGroup,
            duration: 0.3,
            y: this.toasts.length === 1 ? 0 : (this.toasts.length - 1) * 70,
            opacity: 1,
            easing: Konva.Easings.EaseOut
        }).play();

        // Auto dismiss
        toast.timeoutId = setTimeout(() => {
            this.dismiss(toast.id);
        }, duration);

        this.layer.batchDraw();
    }

    private dismiss(id: string): void {
        const toastIndex = this.toasts.findIndex(t => t.id === id);
        if (toastIndex === -1) return;

        const toast = this.toasts[toastIndex];

        // Clear the timeout if it exists
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }

        // Check if the group exists and is still in a layer
        if (toast.group && toast.group.getLayer()) {
            // Animate out
            new Konva.Tween({
                node: toast.group,
                duration: 0.3,
                y: -100,
                opacity: 0,
                easing: Konva.Easings.EaseIn,
                onFinish: () => {
                    toast.group?.destroy();
                    this.layer?.batchDraw();
                }
            }).play();
        } else if (toast.group) {
            // If not in a layer, just destroy it
            toast.group.destroy();
        }

        // Remove from array
        this.toasts.splice(toastIndex, 1);

        // Reposition remaining toasts
        this.repositionToasts();
    }
}

// Export the public API function
export function createNotification(message: string, type: ToastType = 'info', duration: number = 3000): void {
    const manager = ToastManager.getInstance();
    manager.show(message, type, duration);
}