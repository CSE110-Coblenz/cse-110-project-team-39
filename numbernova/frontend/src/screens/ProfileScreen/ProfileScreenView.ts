import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';

export class ProfileScreenView {
    private container: Konva.Container;

    constructor(container: Konva.Container) {
        this.container = container;
        this.initialize();
    }
}

