import { BaseScreen } from '../../core/BaseScreen';
import { InventoryScreenView } from './InventoryScreenView';
import { InventoryScreenModel } from './InventoryScreenModel';
import { getCurrentUser, getUserProfile } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';
import { COLORS } from '../../constants';

export class InventoryScreenController extends BaseScreen {
    private view!: InventoryScreenView;
    private model!: InventoryScreenModel;

    protected initialize(): void {
        this.loadInventoryData();
    }

    private async loadInventoryData(): Promise<void> {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                this.returnToMenu();
                return;
            }

            const userProfile = await getUserProfile(currentUser.id);
            if (!userProfile) {
                this.returnToMenu();
                return;
            }

            this.model = new InventoryScreenModel(currentUser.id, {
                ship_color: userProfile.ship_color,
                unlocked_colors: userProfile.unlocked_colors as Record<string, boolean>
            });

            const ownedColors = this.model.getOwnedColors();
            const currentColor = this.model.getCurrentColor() || COLORS.red;

            this.view = new InventoryScreenView(
                this.container,
                ownedColors,
                currentColor
            );

            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading inventory data:', error);
            this.returnToMenu();
        }
    }

    public show(): void {
        super.show();
    }

    private setupEventListeners(): void {
        this.view.onMenuClick(() => {
            this.returnToMenu();
        });

        this.view.onColorClick(async (color: string) => {
            const success = await this.model.setCurrentColor(color);
            if (success) {
                this.view.updateCurrentColor(color);
                createNotification('Equipped new color!', 'success');
            } else {
                createNotification('You do not own this color.', 'error');
            }
        });
    }

    private returnToMenu(): void {
        this.screenManager.switchTo('menu');
    }
}
