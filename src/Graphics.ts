import Mat22 from './math/Mat22';
import Vec2 from './math/Vec2';
import { Contact } from './physics/Arbiter';
import Body from './physics/Body';
import Joint from './physics/Joint';

window.addEventListener('resize', () => {
    Graphics.openWindow();
});

export default class Graphics {
    static windowWidth: number;
    static windowHeight: number;
    static canvas: HTMLCanvasElement;
    static ctx: CanvasRenderingContext2D;

    static zoom = 50; // pixels per world unit
    static pan = new Vec2(0, 0);

    static width = (): number => {
        return this.windowWidth;
    };

    static height = (): number => {
        return this.windowHeight;
    };

    static openWindow = (): boolean => {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Failed to get 2D context for the canvas.');
            return false;
        }

        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        canvas.width = width;
        canvas.height = height;

        this.canvas = canvas;
        this.ctx = ctx;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        return true;
    };

    static clearScreen = (): void => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    static drawFillCircle = (x: number, y: number, radius: number, color: string): void => {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    };

    static drawText = (
        text: string,
        x: number,
        y: number,
        fontSize: number = 20,
        fontFamily: string = 'Arial',
        color: string = 'white',
        align: CanvasTextAlign = 'left',
        baseline: CanvasTextBaseline = 'middle',
    ): void => {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    };

    static worldToScreen(v: Vec2): Vec2 {
        return new Vec2(
            (v.x - this.pan.x) * this.zoom + this.windowWidth / 2,
            this.windowHeight / 2 - (v.y - this.pan.y) * this.zoom,
        );
    }

    static screenToWorld(v: Vec2): Vec2 {
        return new Vec2(
            (v.x - this.windowWidth / 2) / this.zoom + this.pan.x,
            (this.windowHeight / 2 - v.y) / this.zoom + this.pan.y,
        );
    }

    // TODO: can we generalize drawing to world screen?
    static drawContactPoint = (contact: Contact, color: string): void => {
        const v = this.worldToScreen(contact.position);
        this.ctx.beginPath();
        this.ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    };

    // TODO: can we generalize drawing to world screen?
    static drawBody = (body: Body): void => {
        const R = new Mat22(body.rotation);
        const x = body.position;
        const h = Vec2.scale(0.5, body.width);

        const v1 = this.worldToScreen(Vec2.add(x, Mat22.multiply(R, new Vec2(-h.x, -h.y))));
        const v2 = this.worldToScreen(Vec2.add(x, Mat22.multiply(R, new Vec2(h.x, -h.y))));
        const v3 = this.worldToScreen(Vec2.add(x, Mat22.multiply(R, new Vec2(h.x, h.y))));
        const v4 = this.worldToScreen(Vec2.add(x, Mat22.multiply(R, new Vec2(-h.x, h.y))));

        this.ctx.strokeStyle = body.color;
        this.ctx.beginPath();
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.lineTo(v3.x, v3.y);
        this.ctx.lineTo(v4.x, v4.y);
        this.ctx.lineTo(v1.x, v1.y);
        this.ctx.closePath();
        this.ctx.stroke();
    };

    // TODO: can we generalize drawing to world screen?
    static drawJoint = (joint: Joint, color = 'rgba(128, 128, 204, 1)'): void => {
        if (!joint.body1 || !joint.body2) {
            throw new Error('One or more bodies not initialized in Joint');
        }

        const b1 = joint.body1;
        const b2 = joint.body2;

        const R1 = new Mat22(b1.rotation);
        const R2 = new Mat22(b2.rotation);

        const x1 = b1.position;
        const p1 = Vec2.add(x1, Mat22.multiply(R1, joint.localAnchor1));
        const x2 = b2.position;
        const p2 = Vec2.add(x2, Mat22.multiply(R2, joint.localAnchor2));

        // Convert physics/world coordinates to canvas coordinates
        const sx1 = Graphics.worldToScreen(x1);
        const sp1 = Graphics.worldToScreen(p1);
        const sx2 = Graphics.worldToScreen(x2);
        const sp2 = Graphics.worldToScreen(p2);

        this.ctx.strokeStyle = color;

        this.ctx.beginPath();

        // Line from body1 center to its anchor
        this.ctx.moveTo(sx1.x, sx1.y);
        this.ctx.lineTo(sp1.x, sp1.y);

        // Line from body2 center to its anchor
        this.ctx.moveTo(sx2.x, sx2.y);
        this.ctx.lineTo(sp2.x, sp2.y);

        this.ctx.stroke();
    };
}
