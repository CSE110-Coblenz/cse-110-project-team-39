import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { ShopScreenView } from './ShopScreenView';
import { ShopScreenModel } from './ShopScreenModel';
import { COLORS, DIMENSIONS } from '../../constants';
import { getCurrentUser, getUserProfile } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';

export class ShopScreenController extends BaseScreen {
    private view!: ShopScreenView;
    private model!: ShopScreenModel;


    protected initialize(): void {
        // Don't load data during initialization - wait until screen is shown
        // This prevents navigation side effects during app startup
    }

    private async loadShopData(): Promise<void> {
        try {
            // Get current user
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                console.error('No user logged in');
                // Don't navigate here - just return. The screen will handle this when shown.
                return;
            }

            // Get user profile data
            const userProfile = await getUserProfile(currentUser.id);
            if (!userProfile) {
                console.error('Failed to load user profile');
                this.returnToMenu();
                return;
            }

            // Initialize model with user data
            this.model = new ShopScreenModel(currentUser.id, {
                tokens: userProfile.tokens,
                ship_color: userProfile.ship_color,
                unlocked_colors: userProfile.unlocked_colors as Record<string, boolean>
            });

            // Initialize view with model data
            this.view = new ShopScreenView(
                this.container,
                this.model.getColors(),
                this.model.getColorsUnlocked(),
                this.model.getCurrentColor(),
                this.model.getCurrency()
            );

            this.setupEventListeners();
            console.log('Shop screen loaded successfully!');
        } catch (error) {
            console.error('Error loading shop data:', error);
            this.returnToMenu();
        }
    }

    public async show(): Promise<void> {
        super.show();

        // Load shop data when screen is shown
        if (!this.model || !this.view) {
            await this.loadShopData();
        } else {
            // Reload shop data to reflect updated tokens/colors
            await this.refreshShopData();
        }
    }

    private async refreshShopData(): Promise<void> {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            const userProfile = await getUserProfile(currentUser.id);
            if (!userProfile) return;

            // Update model with fresh data
            this.model = new ShopScreenModel(currentUser.id, {
                tokens: userProfile.tokens,
                ship_color: userProfile.ship_color,
                unlocked_colors: userProfile.unlocked_colors as Record<string, boolean>
            });

            // Update view with new data
            this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
            this.view.updatePerson(this.model.getCurrentColor());
            this.view.updateCurrencyDisplay(this.model.getCurrency());
        } catch (error) {
            console.error('Error refreshing shop data:', error);
        }
    }

    private setupEventListeners(): void {
        this.view.onMenuClick(() => {
            this.returnToMenu();
        });

        this.view.onRedClick(async () => {
            if (await this.model.setCurrentColor(COLORS.red)) {
                this.view.updatePerson(COLORS.red);
            }
        });

        this.view.onOrangeClick(async () => {
            if (await this.model.setCurrentColor(COLORS.orange)) {
                this.view.updatePerson(COLORS.orange);
            }
        });

        this.view.onYellowClick(async () => {
            if (await this.model.setCurrentColor(COLORS.yellow)) {
                this.view.updatePerson(COLORS.yellow);
            }
        });

        this.view.onGreenClick(async () => {
            if (await this.model.setCurrentColor(COLORS.green)) {
                this.view.updatePerson(COLORS.green);
            }
        });

        this.view.onBlueClick(async () => {
            if (await this.model.setCurrentColor(COLORS.blue)) {
                this.view.updatePerson(COLORS.blue);
            }
        });

        this.view.onPurpleClick(async () => {
            if (await this.model.setCurrentColor(COLORS.purple)) {
                this.view.updatePerson(COLORS.purple);
            }
        });


        this.view.onRedOverlayClick(async () => {
            const result = await this.model.unlockColor(COLORS.red);
            this.handleUnlockResult(result, 'Red');
        });

        this.view.onOrangeOverlayClick(async () => {
            const result = await this.model.unlockColor(COLORS.orange);
            this.handleUnlockResult(result, 'Orange');
        });

        this.view.onYellowOverlayClick(async () => {
            const result = await this.model.unlockColor(COLORS.yellow);
            this.handleUnlockResult(result, 'Yellow');
        });

        this.view.onGreenOverlayClick(async () => {
            const result = await this.model.unlockColor(COLORS.green);
            this.handleUnlockResult(result, 'Green');
        });

        this.view.onBlueOverlayClick(async () => {
            const result = await this.model.unlockColor(COLORS.blue);
            this.handleUnlockResult(result, 'Blue');
        });

        this.view.onPurpleOverlayClick(async () => {
            const result = await this.model.unlockColor(COLORS.purple);
            this.handleUnlockResult(result, 'Purple');
        });
    }

    private handleUnlockResult(result: 'success' | 'not-enough-tokens' | 'already-unlocked', colorName: string): void {
        if (result === 'success') {
            this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
            this.view.updateCurrencyDisplay(this.model.getCurrency());
            createNotification(`${colorName} color unlocked! -50 tokens`, 'success');
        } else if (result === 'not-enough-tokens') {
            createNotification('Not enough tokens! Need 50 tokens to unlock', 'error');
        } else if (result === 'already-unlocked') {
            createNotification('This color is already unlocked!', 'info');
        }
    }


    private returnToMenu(): void {
        this.screenManager.switchTo('menu');
    }
}