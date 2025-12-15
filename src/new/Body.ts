import Vec2 from '../math/Vec2';

export class Body {
    position: Vec2;
    rotation: number;

    velocity: Vec2;
    angularVelocity: number;

    hw: number;
    hh: number;
    rd: number;

    cos: number;
    sin: number;

    friction: number;
    invMass: number;
    invI: number;

    color: string;
    visible: boolean;

    deltaTime: number;
    gravity: Vec2;
    ctx: CanvasRenderingContext2D;

    constructor(world: any, setup: any, ctx: CanvasRenderingContext2D) {
        const w = setup.w || 1.0;
        const h = setup.h || 1.0;

        this.position = new Vec2(setup.x || 0.0, setup.y || 0.0);
        this.velocity = new Vec2(setup.vx || 0.0, setup.vy || 0.0);
        this.hw = w * 0.5;
        this.hh = h * 0.5;
        this.rd = Math.sqrt(this.hw * this.hw + this.hh * this.hh);
        this.angularVelocity = setup.angularVelocity || 0.0;
        this.rotation = setup.rotation || 0.0;

        this.cos = Math.cos(this.rotation);
        this.sin = Math.sin(this.rotation);

        this.friction = setup.friction === undefined ? world.friction : setup.friction;
        const mass = setup.mass || Infinity;
        this.color = setup.color || '#FFF';
        this.visible = setup.visible === undefined ? true : setup.visible;

        if (mass < Infinity) {
            this.invMass = 1.0 / mass;
            this.invI = 1.0 / ((mass * (w * w + h * h)) / 12);
        } else {
            this.invMass = 0.0;
            this.invI = 0.0;
        }

        this.deltaTime = world.timeStep;
        this.gravity = setup.gravity || world.gravity;
        this.ctx = ctx;
    }

    integrate() {
        if (this.invMass) {
            this.position.add(Vec2.scale(this.velocity, this.deltaTime));
            this.rotation += this.angularVelocity * this.deltaTime;
            this.velocity.add(Vec2.scale(this.gravity, this.deltaTime));

            this.cos = Math.cos(this.rotation);
            this.sin = Math.sin(this.rotation);
        }
    }

    draw() {
        if (this.visible) {
            const chw = this.cos * this.hw;
            const shw = this.sin * this.hw;
            const chh = this.cos * this.hh;
            const shh = this.sin * this.hh;

            this.ctx.beginPath();
            this.ctx.moveTo(this.position.x - chw + shh, this.position.y - shw - chh);
            this.ctx.lineTo(this.position.x + chw + shh, this.position.y + shw - chh);
            this.ctx.lineTo(this.position.x + chw - shh, this.position.y + shw + chh);
            this.ctx.lineTo(this.position.x - chw - shh, this.position.y - shw + chh);

            this.ctx.closePath();
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();
        }
    }
}
