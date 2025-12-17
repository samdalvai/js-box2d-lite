import Vec2 from '../math/Vec2';

export default class Body {
    static _nextId = 0;
    id: number;

    position: Vec2;
    rotation: number;

    velocity: Vec2;
    angularVelocity: number;

    force: Vec2;
    torque: number;

    width: Vec2;

    friction: number;
    mass: number;
    invMass: number;
    I: number;
    invI: number;

    color: string;

    constructor() {
        this.id = Body._nextId++;

        this.position = new Vec2();
        this.rotation = 0.0;
        this.velocity = new Vec2();
        this.angularVelocity = 0.0;
        this.force = new Vec2();
        this.torque = 0.0;
        this.friction = 0.2;

        this.width = new Vec2();
        this.mass = Infinity;
        this.invMass = 0.0;
        this.I = Infinity;
        this.invI = 0.0;

        this.color = 'white';
    }

    set = (w: Vec2, m: number): void => {
        this.position.set(0.0, 0.0);
        this.rotation = 0.0;
        this.velocity.set(0.0, 0.0);
        this.angularVelocity = 0.0;
        this.force.set(0.0, 0.0);
        this.torque = 0.0;
        this.friction = 0.2;

        this.width = w;
        this.mass = m;

        if (this.mass < Infinity) {
            this.invMass = 1.0 / this.mass;
            this.I = (this.mass * (this.width.x * this.width.x + this.width.y * this.width.y)) / 12;
            this.invI = 1.0 / this.I;
        } else {
            this.invMass = 0.0;
            this.I = Infinity;
            this.invI = 0.0;
        }
    };

    addForce = (f: Vec2): void => {
        this.force.add(f);
    };
}
