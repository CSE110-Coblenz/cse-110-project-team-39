// src/screens/MenuScreen/MenuScreenController.ts
import Konva from 'konva'
import { MenuScreenView } from './MenuScreenView'
import { MenuScreenModel } from './MenuScreenModel'

export class MenuScreenController {
  private layer: Konva.Layer
  private view: MenuScreenView
  private model: MenuScreenModel
  private onPlay?: () => void   // <-- add

  constructor(layer: Konva.Layer) {
    this.layer = layer
    this.model = new MenuScreenModel()
    this.view  = new MenuScreenView(layer)

    // forward view click to whoever binds onPlay
    this.view.onPlay?.(() => this.onPlay && this.onPlay())

    this.layer.draw()
    console.log('MenuScreen loaded successfully!')
  }

  // <-- add: ScreenManager/main can bind this
  public setOnPlay(handler: () => void) {
    this.onPlay = handler
  }
}
