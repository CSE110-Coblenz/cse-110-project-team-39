import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
import { KonvaInput } from '../../components/KonvaInput';

export class SignUpScreenView {
    private layer: Konva.Layer;
    private background: Konva.Rect;
    private stars: Konva.Group;
    private signupForm: Konva.Group;
    
    // Form elements
    private emailInput: KonvaInput;
    private displayNameInput: KonvaInput;
    private passwordInput: KonvaInput;
    private confirmPasswordInput: KonvaInput;
    private signupButton: Konva.Group;
    private loginButton: Konva.Text;
    
    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.createBackground();
        this.createStars();
        this.createSignupForm();
        this.setupTabNavigation();
    }
    
    private createBackground(): void {
        this.background = new Konva.Rect({
                    x: -170,
                    y: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    fillLinearGradientStartPoint: { x: 0, y: 0 },
                    fillLinearGradientEndPoint: { x: DIMENSIONS.width, y: DIMENSIONS.height },
                    fillLinearGradientColorStops: [0, '#060616', 0.5, '#0a0a24', 1, '#0e1033']
                    
                });
                this.layer.add(this.background);
    }
    
    private createStars(): void {
        this.stars = new Konva.Group({ listening: false });

    const makeLayer = (count: number, radiusMax: number, opacity: number, speed: number) => {
        const g = new Konva.Group({ name: 'starLayer', listening: false });
        g.setAttr('speed', speed);
        for (let i = 0; i < count; i++) {
        g.add(new Konva.Circle({
            x: Math.random() * window.innerWidth - 170,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * radiusMax + 0.4,
            fill: '#ffffff',
            opacity: opacity * (0.5 + Math.random() * 0.5)
        }));
        }
        return g;
    };

  // far, mid, near
  this.stars.add(makeLayer(120, 1.2, 0.5, 0.05));
  this.stars.add(makeLayer(80, 1.8, 0.7, 0.12));
  this.stars.add(makeLayer(40, 2.2, 0.9, 0.22));

  this.layer.add(this.stars);
}
    
    private createSignupForm(): void {
        this.signupForm = new Konva.Group({
            x: DIMENSIONS.width / 2,
            y: DIMENSIONS.height / 2
        });
        
        // Title
        const title = new Konva.Text({
            x: -200,
            y: -350,
            width: 400,
            text: 'NumberNova!',
            fontSize: 68,
            fontFamily: 'Jersey 10',
            fill: COLORS.text,
            align: 'center'
        });
        
        const subtitle = new Konva.Text({
            x: -260,
            y: -270,
            width: 520, // wider to keep the longer string on a single line
            text: 'Sign up to help us save the galaxy with the power of math 🚀',
            fontSize: 20,
            fontFamily: 'Jersey 10',
            fill: COLORS.textSecondary,
            align: 'center'
        });
        
        // Signup box background - taller to accommodate extra field
        const signupBox = new Konva.Rect({
            x: -DIMENSIONS.loginBoxWidth / 2,
            y: -180,
            width: DIMENSIONS.loginBoxWidth,
            height: DIMENSIONS.loginBoxHeight + 200, // Extra space for display name + confirm password
            fill: 'rgba(123, 95, 178, 0.1)',
            cornerRadius: 20,
            stroke: COLORS.inputBorder,
            strokeWidth: 2
        });

        // Create input fields
        this.emailInput = new KonvaInput({
            x: -150,
            y: -100,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'Email',
            type: 'text'
        });

        this.displayNameInput = new KonvaInput({
            x: -150,
            y: -20,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'Display Name (optional)',
            type: 'text'
        });

        this.passwordInput = new KonvaInput({
            x: -150,
            y: 60,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'Password',
            type: 'password'
        });

        this.confirmPasswordInput = new KonvaInput({
            x: -150,
            y: 140,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'Confirm Password',
            type: 'password'
        });

        // Signup button - moved down to accommodate extra field
        this.signupButton = this.createButton(-150, 260, 'Launch Mission');

        // Already have account link
        this.loginButton = new Konva.Text({
            x: -100,
            y: 330,
            width: 200,
            text: 'Already have an account?',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: COLORS.primaryLight,
            align: 'center'
        });
        
        this.loginButton.on('mouseenter', () => {
            this.loginButton.fill(COLORS.text);
            this.layer.draw();
        });
        
        this.loginButton.on('mouseleave', () => {
            this.loginButton.fill(COLORS.primaryLight);
            this.layer.draw();
        });
        
        // Add all elements to signup form
        this.signupForm.add(title);
        this.signupForm.add(subtitle);
        this.signupForm.add(signupBox);
        this.signupForm.add(this.emailInput);
        this.signupForm.add(this.displayNameInput);
        this.signupForm.add(this.passwordInput);
        this.signupForm.add(this.confirmPasswordInput);
        this.signupForm.add(this.signupButton);
        this.signupForm.add(this.loginButton);
        
        this.layer.add(this.signupForm);
    }
    
    private setupTabNavigation(): void {
        // Keep track of all inputs for management
        const inputs = [this.emailInput, this.displayNameInput, this.passwordInput, this.confirmPasswordInput];

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
                // Tab backwards - loop to confirm password
                this.confirmPasswordInput.focus();
            } else {
                // Tab forward to display name
                this.displayNameInput.focus();
            }
        });

        this.displayNameInput.on('tab', (e: any) => {
            e.evt.preventDefault(); // Prevent default tab behavior
            this.displayNameInput.blur();
            if (e.shiftKey) {
                // Tab backwards to email
                this.emailInput.focus();
            } else {
                // Tab forward to password
                this.passwordInput.focus();
            }
        });

        this.passwordInput.on('tab', (e: any) => {
            e.evt.preventDefault(); // Prevent default tab behavior
            this.passwordInput.blur();
            if (e.shiftKey) {
                // Tab backwards to display name
                this.displayNameInput.focus();
            } else {
                // Tab forward to confirm password
                this.confirmPasswordInput.focus();
            }
        });

        this.confirmPasswordInput.on('tab', (e: any) => {
            e.evt.preventDefault(); // Prevent default tab behavior
            this.confirmPasswordInput.blur();
            if (e.shiftKey) {
                // Tab backwards to password
                this.passwordInput.focus();
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
                this.displayNameInput.blur();
                this.passwordInput.blur();
                this.confirmPasswordInput.blur();
            }
        });

        // Handle Enter key from inputs
        const handleEnter = () => {
            this.signupButton.fire('click');
        };

        this.emailInput.on('enter', handleEnter);
        this.displayNameInput.on('enter', handleEnter);
        this.passwordInput.on('enter', handleEnter);
        this.confirmPasswordInput.on('enter', handleEnter);
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
    
    public getSignupButton(): Konva.Group {
        return this.signupButton;
    }
    
    public getLoginButton(): Konva.Text {
        return this.loginButton;
    }
    
    public getEmailValue(): string {
        return this.emailInput.getValue();
    }

    public getDisplayNameValue(): string {
        return this.displayNameInput.getValue();
    }

    public getPasswordValue(): string {
        return this.passwordInput.getValue();
    }

    public getConfirmPasswordValue(): string {
        return this.confirmPasswordInput.getValue();
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
