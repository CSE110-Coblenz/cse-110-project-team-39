import { MenuScreenView } from './MenuScreenView'
import { MenuScreenModel } from './MenuScreenModel'
import { BaseScreen } from '../../core/BaseScreen'

export class MenuScreenController extends BaseScreen {
  private view: MenuScreenView
  private model: MenuScreenModel

  protected initialize(): void {
    this.model = new MenuScreenModel()
    this.view = new MenuScreenView(this.container)

    this.view.onLogout?.(() => {
      this.screenManager.switchTo('login')
    })

    this.view.onLeaderboard?.(() => {
      console.log('Leaderboard clicked! Switching to leaderboard screen...')
      this.screenManager.switchTo('leaderboard')
    })

    this.view.onShop?.(() => {
      console.log('Shop clicked! Switching to shop screen...')
      this.screenManager.switchTo('shop')
    })

    this.view.onPlayerIcon?.(() => {
      console.log('Player icon clicked! Switching to profile screen...')
      this.screenManager.switchTo('profile')
    })

    this.view.onPlanetClick?.((planetIndex: number) => {
      console.log(`Planet ${planetIndex + 1} clicked! Launching mission...`)

      const worldNumber = planetIndex + 1

      const launchScreen = this.screenManager.getScreen('launchTransition') as any
      if (launchScreen && typeof launchScreen.setPlanetNumber === 'function') {
        launchScreen.setPlanetNumber(worldNumber)
      }

      const gameplayScreen = this.screenManager.getScreen('gameplay') as any
      if (gameplayScreen && typeof gameplayScreen.setWorldNumber === 'function') {
        gameplayScreen.setWorldNumber(worldNumber)
      }

      this.screenManager.switchTo('launchTransition')
    })

    this.view.showTutorial(
      'Welcome to NumberNova!\n\n' +
        '• Solve math expressions to defeat aliens.\n' +
        '• Drag number and operation cards into the slots to form a valid equation.\n' +
        '• Correct answers score points and damage the alien.\n' +
        '• Wrong answers cost you lives.\n' +
        '• Higher scores move you up the leaderboard.\n\n' +
        'Tap OK to start playing.'
    )

    const okButton = this.view.getTutorialOkButton()
    okButton?.on('click', () => {
      this.view.hideTutorial()
    })

    this.view.onPlay?.(() => {
      console.log('Play button clicked!')
    })

    this.container.getStage()?.draw()
    console.log('MenuScreen loaded successfully!')
  }

  public show(): void {
    super.show()
  }
}
