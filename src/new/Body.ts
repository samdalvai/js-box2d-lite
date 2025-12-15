import Vec2 from '../math/Vec2';

export class Body {
    position: Vec2;
    velocity: Vec2;
    
    hw: number;
    hh: number;
    rd: number;
    va: number;
    ra: number;

    cos: number;
    sin: number;

    friction: number;
    color: string;
    visible: boolean;

    iM: number;
    iI: number;

    dt: number;
    gravity: number;
    ctx: CanvasRenderingContext2D;

    constructor(world: any, setup: any, ctx: CanvasRenderingContext2D) {
        const w = setup.w || 1.0;
        const h = setup.h || 1.0;

        this.position = new Vec2(setup.x || 0.0, setup.y || 0.0);
        this.velocity = new Vec2(setup.vx || 0.0, setup.vy || 0.0);
        this.hw = w * 0.5;
        this.hh = h * 0.5;
        this.rd = Math.sqrt(this.hw * this.hw + this.hh * this.hh);
        this.va = setup.angularVelocity || 0.0;
        this.ra = setup.rotation || 0.0;

        this.cos = Math.cos(this.ra);
        this.sin = Math.sin(this.ra);

        this.friction = setup.friction === undefined ? world.friction : setup.friction;
        const mass = setup.mass || Infinity;
        this.color = setup.color || '#FFF';
        this.visible = setup.visible === undefined ? true : setup.visible;

        if (mass < Infinity) {
            this.iM = 1.0 / mass;
            this.iI = 1.0 / ((mass * (w * w + h * h)) / 12);
        } else {
            this.iM = 0.0;
            this.iI = 0.0;
        }

        this.dt = world.timeStep;
        this.gravity = setup.gravity || world.gravity;
        this.ctx = ctx;
    }

    integrate() {
        if (this.iM) {
            this.position.x += this.velocity.x * this.dt;
            this.position.y += this.velocity.y * this.dt;
            this.ra += this.va * this.dt;
            this.velocity.y += this.gravity * this.dt;

            this.cos = Math.cos(this.ra);
            this.sin = Math.sin(this.ra);
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
