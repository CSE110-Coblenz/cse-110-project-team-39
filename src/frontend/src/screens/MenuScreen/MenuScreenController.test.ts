// src/screens/MenuScreen/MenuScreenController.test.ts

// Mock Supabase so Jest never evaluates import.meta.env inside supabase.ts
jest.mock('../../lib/supabase', () => ({
  signOut: jest.fn().mockResolvedValue({ error: null }),
}));

// Mock toast notifications
jest.mock('../../lib/toast', () => ({
  createNotification: jest.fn(),
}));

import { MenuScreenController } from './MenuScreenController'

const mockDraw = jest.fn()
const mockGetStage = jest.fn(() => ({ draw: mockDraw }))

let mockViewInstance: any
let mockTutorialOkButton: any

jest.mock('./MenuScreenView', () => {
  return {
    MenuScreenView: jest.fn().mockImplementation((_container: any) => {
      mockTutorialOkButton = {
        on: jest.fn()
      }

      mockViewInstance = {
        onLogout: jest.fn(),
        onLeaderboard: jest.fn(),
        onShop: jest.fn(),
        onPlayerIcon: jest.fn(),
     //   onInventory: jest.fn(),
        onPlanetClick: jest.fn(),
        onPlay: jest.fn(),

        // NEW: tutorial popup API
        showTutorial: jest.fn(),
        hideTutorial: jest.fn(),
        getTutorialOkButton: jest.fn(() => mockTutorialOkButton)
      }
      return mockViewInstance
    })
  }
})

jest.mock('./MenuScreenModel', () => {
  return {
    MenuScreenModel: jest.fn().mockImplementation(() => ({}))
  }
})

// IMPORTANT: mock BaseScreen with ONE-ARG constructor
jest.mock('../../core/BaseScreen', () => {
  class MockBaseScreen {
    protected screenManager: any
    protected container: any

    constructor(screenManager: any) {
      this.screenManager = screenManager
      this.container = { getStage: mockGetStage }

      if ((this as any).initialize) {
        ;(this as any).initialize()
      }
    }

    public show(): void {}
  }

  return { BaseScreen: MockBaseScreen }
})

describe('MenuScreenController', () => {
  let screenManager: any
  let controller: MenuScreenController
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    screenManager = {
      switchTo: jest.fn(),
      getScreen: jest.fn()
    }

    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    // ONE argument, matches real constructor type
    controller = new MenuScreenController(screenManager as any)
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('registers handlers on the view, shows tutorial, wires OK button, and draws the stage on initialize', () => {
    // existing handler expectations
    expect(mockViewInstance.onLogout).toHaveBeenCalledTimes(1)
    expect(mockViewInstance.onLeaderboard).toHaveBeenCalledTimes(1)
    expect(mockViewInstance.onShop).toHaveBeenCalledTimes(1)
    expect(mockViewInstance.onPlayerIcon).toHaveBeenCalledTimes(1)
  //  expect(mockViewInstance.onInventory).toHaveBeenCalledTimes(1)
    expect(mockViewInstance.onPlanetClick).toHaveBeenCalledTimes(1)
    expect(mockViewInstance.onPlay).toHaveBeenCalledTimes(1)

    // NEW: tutorial popup wiring
    expect(mockViewInstance.showTutorial).toHaveBeenCalledTimes(1)
    expect(mockViewInstance.getTutorialOkButton).toHaveBeenCalledTimes(1)
    expect(mockTutorialOkButton.on).toHaveBeenCalledTimes(1)
    expect(mockTutorialOkButton.on).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    )

    // stage draw still happens
    expect(mockGetStage).toHaveBeenCalledTimes(1)
    expect(mockDraw).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith('MenuScreen loaded successfully!')
  })

  it('hides tutorial when OK button is clicked', () => {
    // handler registered during initialize
    const okClickHandler = mockTutorialOkButton.on.mock.calls[0][1]
    okClickHandler()
    expect(mockViewInstance.hideTutorial).toHaveBeenCalledTimes(1)
  })

  it('switches to login screen when logout handler is triggered', async () => {
    const logoutHandler = mockViewInstance.onLogout.mock.calls[0][0]
    await logoutHandler()
    expect(screenManager.switchTo).toHaveBeenCalledWith('login')
  })

  it('switches to leaderboard screen when leaderboard handler is triggered', () => {
    const handler = mockViewInstance.onLeaderboard.mock.calls[0][0]
    handler()
    expect(screenManager.switchTo).toHaveBeenCalledWith('leaderboard')
  })

  it('switches to shop screen when shop handler is triggered', () => {
    const handler = mockViewInstance.onShop.mock.calls[0][0]
    handler()
    expect(screenManager.switchTo).toHaveBeenCalledWith('shop')
  })

  it('switches to profile screen when player icon handler is triggered', () => {
    const handler = mockViewInstance.onPlayerIcon.mock.calls[0][0]
    handler()
    expect(screenManager.switchTo).toHaveBeenCalledWith('profile')
  })

 

  it('sets planet/world numbers and switches to launchTransition on planet click', () => {
    const mockLaunchScreen = { setPlanetNumber: jest.fn() }
    const mockGameplayScreen = { setWorldNumber: jest.fn() }

    screenManager.getScreen = jest.fn((name: string) => {
      if (name === 'launchTransition') return mockLaunchScreen
      if (name === 'gameplay') return mockGameplayScreen
      return null
    })

    const planetClickHandler = mockViewInstance.onPlanetClick.mock.calls[0][0]
    planetClickHandler(1)

    expect(mockLaunchScreen.setPlanetNumber).toHaveBeenCalledWith(2)
    expect(mockGameplayScreen.setWorldNumber).toHaveBeenCalledWith(2)
    expect(screenManager.switchTo).toHaveBeenCalledWith('launchTransition')
  })

  it('wires play button handler without switching screens yet', () => {
    const playHandler = mockViewInstance.onPlay.mock.calls[0][0]
    playHandler()
    expect(consoleSpy).toHaveBeenCalledWith('Play button clicked!')
    expect(screenManager.switchTo).not.toHaveBeenCalledWith('gameplay')
  })

  it('show delegates to BaseScreen.show without throwing', () => {
    expect(() => controller.show()).not.toThrow()
  })
})
