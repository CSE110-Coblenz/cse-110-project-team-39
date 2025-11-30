import { BaseScreen } from '../../core/BaseScreen';
import { ProfileScreenModel } from './ProfileScreenModel';
import { ProfileScreenView } from './ProfileScreenView';

export class ProfileScreenController extends BaseScreen {
  private model: ProfileScreenModel;
  private view: ProfileScreenView;

  protected initialize(): void {
    this.model = new ProfileScreenModel();
    this.view = new ProfileScreenView(this.container);

    this.setupEventListeners();
  }

  private async loadProfile(): Promise<void> {
    try {
      console.log('[ProfileScreen] Loading profile data...');
      const data = await this.model.getProfileWithRank();

      if (!data) {
        console.warn('[ProfileScreen] No current user found for profile screen');
        this.screenManager.switchTo('login');
        return;
      }

      this.view.renderProfile(data);
      this.container.getStage()?.draw();
      console.log('[ProfileScreen] Profile loaded successfully');
    } catch (err) {
      console.error('[ProfileScreen] Error loading profile data:', err);
    }
  }

  private setupEventListeners(): void {
    this.view.getBackButton().on('click', () => {
      this.screenManager.switchTo('menu');
    });
  }

  public override show(): void {
    super.show();
    this.loadProfile();
  }
}
