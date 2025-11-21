import { MenuScreenView } from './MenuScreenView'
import { MenuScreenModel } from './MenuScreenModel'
import { BaseScreen } from '../../core/BaseScreen'

export class MenuScreenController extends BaseScreen {
  private view: MenuScreenView
  private model: MenuScreenModel

  protected initialize(): void {
    this.model = new MenuScreenModel()
    this.view = new MenuScreenView(this.container)

    // Handle logout button
    this.view.onLogout?.(() => {
      this.screenManager.switchTo('login')
    })

    // Handle top right buttons
    this.view.onLeaderboard?.(() => {
      console.log('Leaderboard clicked! Switching to leaderboard screen...');
      this.screenManager.switchTo('leaderboard');
    })

    this.view.onShop?.(() => {
      console.log('Shop clicked! Switching to shop screen...');
      this.screenManager.switchTo('shop');
    })

    this.view.onPlayerIcon?.(() => {
      console.log('Player icon clicked! Switching to profile screen...');
      this.screenManager.switchTo('profile');
    })

    // ADDED: Handle planet clicks
    this.view.onPlanetClick?.((planetIndex: number) => {
      console.log(`Planet ${planetIndex + 1} clicked! Launching mission...`);

      const worldNumber = planetIndex + 1;

      // Set the planet number on BOTH launch transition and gameplay screens
      const launchScreen = this.screenManager.getScreen('launchTransition') as any;
      if (launchScreen && launchScreen.setPlanetNumber) {
        launchScreen.setPlanetNumber(worldNumber);
      }

      const gameplayScreen = this.screenManager.getScreen('gameplay') as any;
      if (gameplayScreen && gameplayScreen.setWorldNumber) {
        gameplayScreen.setWorldNumber(worldNumber);
      }

      // Switch to launch transition screen
      this.screenManager.switchTo('launchTransition');
    })

    // Handle play button
    this.view.onPlay?.(() => {
      console.log('Play button clicked!');
      // this.screenManager.switchTo('gameplay'); // When ready
    })

    this.container.getStage()?.draw()
    console.log('MenuScreen loaded successfully!')
  }

  public show(): void {
    super.show()
  }
}