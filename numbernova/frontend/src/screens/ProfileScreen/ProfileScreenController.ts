import { BaseScreen } from '../../core/BaseScreen';
import { ProfileScreenModel } from './ProfileScreenModel';
import { ProfileScreenView } from './ProfileScreenView';

export class ProfileScreenController extends BaseScreen {
  private model!: ProfileScreenModel;
  private view!: ProfileScreenView;

  protected initialize(): void {
    this.model = new ProfileScreenModel();
    this.view = new ProfileScreenView(this.container);

    this.setupEventListeners();
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    try {
      console.log('Loading profile data...');
      const data = await this.model.getProfileWithRank();

      if (!data) {
        console.warn('No current user found for profile screen');
        // Optionally redirect to login
        // this.screenManager.switchTo('login');
        return;
      }

      this.view.renderProfile(data);
      console.log('ProfileScreen loaded successfully!');
    } catch (err) {
      console.error('Error loading profile data:', err);
    }
  }

  private setupEventListeners(): void {
    this.view.getBackButton().on('click', () => {
      this.screenManager.switchTo('menu');
    });
  }

  public show(): void {
    super.show();
  }
}
