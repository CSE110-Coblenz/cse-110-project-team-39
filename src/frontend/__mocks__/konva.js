// __mocks__/konva.js

class MockNode {
  add() {
    return this;
  }
  destroy() {
    return this;
  }
}

class MockGroup extends MockNode {}
class MockRect extends MockNode {}
class MockText extends MockNode {}
class MockCircle extends MockNode {}

class MockLayer extends MockNode {
  add(node) {
    return this;
  }
  addTo(stage) {
    return this;
  }
  draw() {}
}

class MockStage extends MockNode {
  container() {
    return { style: {} };
  }
  add(layer) {
    return this;
  }
}

class MockAnimation {
  constructor(cb, layer) {}
  start() {}
  stop() {}
}

const Konva = {
  Group: MockGroup,
  Rect: MockRect,
  Text: MockText,
  Circle: MockCircle,
  Layer: MockLayer,
  Stage: MockStage,
  Animation: MockAnimation,
};

module.exports = {
  __esModule: true,
  default: Konva,
  Konva,
};
