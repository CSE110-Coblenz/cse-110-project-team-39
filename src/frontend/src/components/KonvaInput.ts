import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../constants';

export interface KonvaInputConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    placeholder: string;
    type?: 'text' | 'password';
    fontSize?: number;
    fontFamily?: string;
}

export class KonvaInput extends Konva.Group {
    private background: Konva.Rect;
    private placeholderText: Konva.Text;
    private valueText: Konva.Text;
    private cursor: Konva.Rect;
    private cursorAnimation: Konva.Animation | null = null;
    
    // Hidden HTML input for native text handling
    private hiddenInput: HTMLInputElement;
    
    private inputValue: string = '';
    private isFocused: boolean = false;
    private placeholder: string;
    private type: 'text' | 'password';
    private fontSize: number;
    private fontFamily: string;
    
    constructor(config: KonvaInputConfig) {
        super({ x: config.x, y: config.y });
        
        this.placeholder = config.placeholder;
        this.type = config.type || 'text';
        this.fontSize = config.fontSize || 18;
        this.fontFamily = config.fontFamily || 'Arial';
        
        // Create background
        this.background = new Konva.Rect({
            width: config.width,
            height: config.height,
            fill: COLORS.inputBackground,
            cornerRadius: 25,
            stroke: COLORS.inputBorder,
            strokeWidth: 2
        });
        
        // Create placeholder text
        this.placeholderText = new Konva.Text({
            x: 20,
            y: (config.height - this.fontSize) / 2,
            text: this.placeholder,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fill: COLORS.textSecondary,
            visible: true
        });
        
        // Create value text
        this.valueText = new Konva.Text({
            x: 20,
            y: (config.height - this.fontSize) / 2,
            text: '',
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fill: COLORS.text,
            visible: false
        });
        
        // Create cursor
        this.cursor = new Konva.Rect({
            x: 20,
            y: (config.height - this.fontSize) / 2 - 2,
            width: 2,
            height: this.fontSize + 4,
            fill: COLORS.text,
            visible: false
        });
        
        // Add all elements
        this.add(this.background);
        this.add(this.placeholderText);
        this.add(this.valueText);
        this.add(this.cursor);
        
        // Create hidden input element
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = this.type;
        this.hiddenInput.placeholder = this.placeholder;
        this.hiddenInput.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: 1px;
            height: 1px;
            opacity: 0;
            z-index: -1;
        `;
        document.body.appendChild(this.hiddenInput);
        
        this.setupEventListeners();
        this.setupHiddenInputListeners();
        this.setupWindowListeners();
    }
    
    private setupEventListeners(): void {
        // Hover effects
        this.on('mouseenter', () => {
            // Always show text cursor when hovering input
            const stage = this.getStage();
            if (stage) {
                stage.container().style.cursor = 'text';
            }
            
            if (!this.isFocused) {
                this.background.stroke(COLORS.primaryLight);
                this.background.strokeWidth(3.5);
            }
            this.getLayer()?.draw();
        });
        
        this.on('mouseleave', () => {
            // Reset cursor when leaving input
            const stage = this.getStage();
            if (stage) {
                stage.container().style.cursor = 'default';
            }
            
            if (!this.isFocused) {
                this.background.stroke(COLORS.inputBorder);
                this.background.strokeWidth(2);
            }
            this.getLayer()?.draw();
        });
        
        // Click to focus
        this.on('click', () => {
            this.focus();
        });
    }
    
    public focus(): void {
        if (this.isFocused) return;
        
        this.isFocused = true;
        this.background.stroke(COLORS.primaryLight);
        this.background.strokeWidth(4.5);
        
        // Show cursor
        this.cursor.visible(true);
        this.startCursorBlink();
        
        // Update cursor position
        this.updateCursorPosition();
        
        // Focus the hidden input
        this.hiddenInput.focus();
        
        this.getLayer()?.draw();
    }
    
    public blur(): void {
        if (!this.isFocused) return;

        this.isFocused = false;
        this.background.stroke(COLORS.inputBorder);
        this.background.strokeWidth(2);

        // Hide cursor
        this.cursor.visible(false);
        this.stopCursorBlink();

        // Reset cursor to default when blurring
        const stage = this.getStage();
        if (stage) {
            stage.container().style.cursor = 'default';
        }

        // Blur the hidden input
        this.hiddenInput.blur();

        this.getLayer()?.draw();
    }
    
    private startCursorBlink(): void {
        let frameCount = 0;
        const blinkRate = 30; // Blink every 30 frames (about 0.5 seconds at 60fps)
        
        this.cursorAnimation = new Konva.Animation((frame) => {
            frameCount++;
            if (frameCount >= blinkRate) {
                frameCount = 0;
                this.cursor.visible(!this.cursor.visible());
            }
        }, this.getLayer());
        
        this.cursorAnimation.start();
    }
    
    private stopCursorBlink(): void {
        this.cursorAnimation?.stop();
        this.cursorAnimation = null;
    }
    
    private updateCursorPosition(): void {
        // Create a temporary text node to measure the actual width
        const tempText = new Konva.Text({
            text: this.type === 'password' ? '•'.repeat(this.inputValue.length) : this.inputValue,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily
        });
        const textWidth = tempText.width();
        tempText.destroy();
        
        // Position cursor at the end of the text
        this.cursor.x(20 + textWidth + 2);
    }
    
    private setupHiddenInputListeners(): void {
        // Listen to all input events for native text handling
        this.hiddenInput.addEventListener('input', () => {
            this.inputValue = this.hiddenInput.value;
            this.updateDisplay();
        });
        
        // Handle tab navigation
        this.hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Fire our custom tab event
                this.fire('tab', { shiftKey: e.shiftKey, evt: e });
            } else if (e.key === 'Enter') {
                // Fire enter event
                this.fire('enter');
            }
        });
        
        // Sync focus state
        this.hiddenInput.addEventListener('focus', () => {
            if (!this.isFocused) {
                this.focus();
            }
        });
        
        this.hiddenInput.addEventListener('blur', () => {
            // Small delay to check if we're refocusing
            setTimeout(() => {
                if (document.activeElement !== this.hiddenInput && this.isFocused) {
                    this.blur();
                }
            }, 10);
        });
    }
    
    private windowBlurHandler = () => {
        if (this.isFocused) {
            this.blur();
        }
    };
    
    private visibilityChangeHandler = () => {
        if (document.hidden && this.isFocused) {
            this.blur();
        }
    };
    
    private setupWindowListeners(): void {
        // Blur input when window loses focus
        window.addEventListener('blur', this.windowBlurHandler);
        
        // Also handle visibility change (tab switching)
        document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
    
    private updateDisplay(): void {
        if (this.inputValue.length > 0) {
            // Show value, hide placeholder
            this.placeholderText.visible(false);
            this.valueText.visible(true);
            
            if (this.type === 'password') {
                this.valueText.text('•'.repeat(this.inputValue.length));
            } else {
                this.valueText.text(this.inputValue);
            }
        } else {
            // Show placeholder, hide value
            this.placeholderText.visible(true);
            this.valueText.visible(false);
        }
        
        this.updateCursorPosition();
        this.getLayer()?.draw();
    }

    public getValue(): string {
        return this.inputValue;
    }

    
    public setValue(value: string): void {
        this.inputValue = value;
        this.hiddenInput.value = value;
        this.updateDisplay();
    }
    
    public getIsFocused(): boolean {
        return this.isFocused;
    }
    
    public destroy(): this {
        this.blur();

        if (this.hiddenInput.parentNode) {
            this.hiddenInput.parentNode.removeChild(this.hiddenInput);
        }

        window.removeEventListener('blur', this.windowBlurHandler);
        document.removeEventListener('visibilitychange', this.visibilityChangeHandler);

        super.destroy();
        return this;
    }

}