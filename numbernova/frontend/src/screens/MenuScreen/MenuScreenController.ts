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
      console.log(`Planet ${planetIndex + 1} clicked! Will redirect to level ${planetIndex + 1}`);
      // TODO: Add level navigation later
      // this.screenManager.switchTo(`level${planetIndex + 1}`);
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