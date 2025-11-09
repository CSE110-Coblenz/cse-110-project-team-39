import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
import { KonvaInput } from '../../components/KonvaInput';

export class LoginScreenView {
    private layer: Konva.Layer;
    private background: Konva.Rect;
    private stars: Konva.Group;
    private loginForm: Konva.Group;
    
    // Form elements
    private emailInput: KonvaInput;
    private passwordInput: KonvaInput;
    private loginButton: Konva.Group;
    private createAccountButton: Konva.Text;
    
    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.createBackground();
        this.createStars();
        this.createLoginForm();
        this.setupTabNavigation();
    }
    
    private createBackground(): void {
        this.background = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: COLORS.background
        });
        this.layer.add(this.background);
    }
    
    private createStars(): void {
        this.stars = new Konva.Group();
        
        // Create random stars
        for (let i = 0; i < 100; i++) {
            const star = new Konva.Circle({
                x: Math.random() * DIMENSIONS.width,
                y: Math.random() * DIMENSIONS.height,
                radius: Math.random() * 2,
                fill: '#ffffff',
                opacity: Math.random() * 0.8
            });
            this.stars.add(star);
        }
        
        this.layer.add(this.stars);
    }
    
    private createLoginForm(): void {
        this.loginForm = new Konva.Group({
            x: DIMENSIONS.width / 2,
            y: DIMENSIONS.height / 2
        });
        
        // Title
        const title = new Konva.Text({
            x: -200,
            y: -250,
            width: 400,
            text: 'Number Nova',
            fontSize: 48,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center'
        });
        
        const subtitle = new Konva.Text({
            x: -200,
            y: -180,
            width: 400,
            text: 'Log in to help us save the galaxy with the power of math',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: COLORS.textSecondary,
            align: 'center'
        });
        
        // Login box background
        const loginBox = new Konva.Rect({
            x: -DIMENSIONS.loginBoxWidth / 2,
            y: -100,
            width: DIMENSIONS.loginBoxWidth,
            height: DIMENSIONS.loginBoxHeight,
            fill: 'rgba(123, 95, 178, 0.1)',
            cornerRadius: 20,
            stroke: COLORS.inputBorder,
            strokeWidth: 2
        });
        
        // Create input fields
        this.emailInput = new KonvaInput({
            x: -150,
            y: -30,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'Email',
            type: 'text'
        });
        
        this.passwordInput = new KonvaInput({
            x: -150,
            y: 40,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'Password',
            type: 'password'
        });
        
        // Login button
        this.loginButton = this.createButton(-150, 120, 'Launch Mission');
        
        // Create account link
        this.createAccountButton = new Konva.Text({
            x: -100,
            y: 190,
            width: 200,
            text: 'Create Account',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: COLORS.primaryLight,
            align: 'center'
        });
        
        this.createAccountButton.on('mouseenter', () => {
            this.createAccountButton.fill(COLORS.text);
            this.layer.draw();
        });
        
        this.createAccountButton.on('mouseleave', () => {
            this.createAccountButton.fill(COLORS.primaryLight);
            this.layer.draw();
        });
        
        // Add all elements to login form
        this.loginForm.add(title);
        this.loginForm.add(subtitle);
        this.loginForm.add(loginBox);
        this.loginForm.add(this.emailInput);
        this.loginForm.add(this.passwordInput);
        this.loginForm.add(this.loginButton);
        this.loginForm.add(this.createAccountButton);
        
        this.layer.add(this.loginForm);
    }
    
    private setupTabNavigation(): void {
        // Keep track of all inputs for management
        const inputs = [this.emailInput, this.passwordInput];
        
        // When clicking on one input, blur all others
        inputs.forEach(input => {
            input.on('click', () => {
                inputs.forEach(otherInput => {
                    if (otherInput !== input) {
                        otherInput.blur();
                    }
                });
            });
        });
        
        // Handle tab navigation between inputs
        this.emailInput.on('tab', (e: any) => {
            e.evt.preventDefault(); // Prevent default tab behavior
            this.emailInput.blur();
            if (e.shiftKey) {
                // Tab backwards - loop to password
                this.passwordInput.focus();
            } else {
                // Tab forward to password
                this.passwordInput.focus();
            }
        });
        
        this.passwordInput.on('tab', (e: any) => {
            e.evt.preventDefault(); // Prevent default tab behavior
            this.passwordInput.blur();
            if (e.shiftKey) {
                // Tab backwards to email
                this.emailInput.focus();
            } else {
                // Tab forward - loop back to email
                this.emailInput.focus();
            }
        });
        
        // Click outside to unfocus all inputs
        this.layer.on('click', (e) => {
            // If clicking on empty space, blur all inputs
            if (e.target === this.layer || e.target === this.background) {
                this.emailInput.blur();
                this.passwordInput.blur();
            }
        });
        
        // Handle Enter key from inputs
        const handleEnter = () => {
            this.loginButton.fire('click');
        };
        
        this.emailInput.on('enter', handleEnter);
        this.passwordInput.on('enter', handleEnter);
    }
    
    private createButton(x: number, y: number, text: string): Konva.Group {
        const group = new Konva.Group({ x, y });
        
        const background = new Konva.Rect({
            width: DIMENSIONS.buttonWidth,
            height: DIMENSIONS.buttonHeight,
            fill: COLORS.primary,
            cornerRadius: 25,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 },
            shadowOpacity: 0.3
        });
        
        const buttonText = new Konva.Text({
            width: DIMENSIONS.buttonWidth,
            height: DIMENSIONS.buttonHeight,
            text: text,
            fontSize: 20,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
            verticalAlign: 'middle'
        });
        
        group.add(background);
        group.add(buttonText);
        
        // Add hover effects
        group.on('mouseenter', () => {
            background.fill(COLORS.primaryLight);
            document.body.style.cursor = 'pointer';
            this.layer.draw();
        });
        
        group.on('mouseleave', () => {
            background.fill(COLORS.primary);
            document.body.style.cursor = 'default';
            this.layer.draw();
        });
        
        return group;
    }
    
    public getLoginButton(): Konva.Group {
        return this.loginButton;
    }
    
    public getCreateAccountButton(): Konva.Text {
        return this.createAccountButton;
    }
    
    public getEmailValue(): string {
        return this.emailInput.getValue();
    }
    
    public getPasswordValue(): string {
        return this.passwordInput.getValue();
    }
    
    public animateStars(): void {
        this.stars.children.forEach((star: Konva.Node) => {
            const duration = Math.random() * 3 + 1;
            
            // Create a looping animation for each star individually
            const anim = new Konva.Animation((frame) => {
                const period = duration * 1000; // Convert to milliseconds
                const phase = (frame.time % period) / period;
                const opacity = 0.2 + Math.sin(phase * Math.PI) * 0.6;
                star.opacity(opacity);
            });
            
            anim.start();
        });
    }
    
    public focusEmailInput(): void {
        this.emailInput.focus();
    }
}