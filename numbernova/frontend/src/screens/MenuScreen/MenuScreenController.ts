import Konva from 'konva'
import { MenuScreenView } from './MenuScreenView'
import { MenuScreenModel } from './MenuScreenModel'
import { BaseScreen } from '../../core/BaseScreen' // ADD THIS

export class MenuScreenController extends BaseScreen { // EXTEND BaseScreen
  private view: MenuScreenView
  private model: MenuScreenModel

  // REMOVE the constructor and use initialize() instead
  protected initialize(): void {
    this.model = new MenuScreenModel()
    this.view = new MenuScreenView(this.container)

    // Handle logout button - use screenManager to switch back to login
    this.view.onLogout?.(() => {
      this.screenManager.switchTo('login')
    })

    // Handle play button
    this.view.onPlay?.(() => {
      console.log('Play button clicked!')
      // this.screenManager.switchTo('gameplay') // When ready
    })

    this.container.getStage()?.draw()
    console.log('MenuScreen loaded successfully!')
  }

  public show(): void {
    super.show()
    // Add any menu-specific show logic here if needed
  }
}