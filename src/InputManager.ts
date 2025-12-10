import Vec2 from './math/Vec2';

export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

export default class InputManager {
    static keyboardInputBuffer: KeyboardEvent[];
    static mouseInputBuffer: MouseEvent[];
    static mouseMoveBuffer: MouseEvent[];
    static mousePosition: Vec2;

    static initialize = () => {
        this.keyboardInputBuffer = [];
        this.mouseInputBuffer = [];
        this.mouseMoveBuffer = [];
        this.mousePosition = new Vec2();

        window.addEventListener('keydown', this.handleKeyboardEvent);
        window.addEventListener('keyup', this.handleKeyboardEvent);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseClick);
        window.addEventListener('mouseup', this.handleMouseClick);

        window.addEventListener('contextmenu', e => {
            e.preventDefault();
        });
    };

    static handleKeyboardEvent = (event: KeyboardEvent) => {
        this.keyboardInputBuffer.push(event);
    };

    static handleMouseMove = (event: MouseEvent) => {
        this.mousePosition.x = event.x;
        this.mousePosition.y = event.y;
        this.mouseMoveBuffer.push(event);
    };

    static handleMouseClick = (event: MouseEvent) => {
        this.mouseInputBuffer.push(event);
    };
}
