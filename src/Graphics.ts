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

    /**
     * Start world coordinates to screen conversion.
     * 
     * This is used because box 2d uses a standard coordinate system for objects 
     * positions and dimensions
     */
    static beginWorld(): void {
        const ctx = this.ctx;

        ctx.save();

        // Move origin to screen center
        ctx.translate(this.windowWidth / 2, this.windowHeight / 2);

        // Flip Y axis (world Y up, canvas Y down)
        ctx.scale(this.zoom, -this.zoom);

        // Apply camera pan
        ctx.translate(-this.pan.x, -this.pan.y);

        ctx.lineWidth = 1 / this.zoom;
    }

    /** Restore coordinates to screen conversion */
    static endWorld(): void {
        this.ctx.restore();
    }

    static screenToWorld(v: Vec2): Vec2 {
        return new Vec2(
            (v.x - this.windowWidth / 2) / this.zoom + this.pan.x,
            (this.windowHeight / 2 - v.y) / this.zoom + this.pan.y,
        );
    }

    static drawContactPoint = (contact: Contact, color = 'red'): void => {
        const v = contact.position;
        this.ctx.beginPath();
        this.ctx.arc(v.x, v.y, 5 / this.zoom, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    };

    static drawBody = (body: Body): void => {
        const R = new Mat22(body.rotation);
        const x = body.position;
        const h = Vec2.scale(0.5, body.width);

        const v1 = Vec2.add(x, Mat22.multiply(R, new Vec2(-h.x, -h.y)));
        const v2 = Vec2.add(x, Mat22.multiply(R, new Vec2(h.x, -h.y)));
        const v3 = Vec2.add(x, Mat22.multiply(R, new Vec2(h.x, h.y)));
        const v4 = Vec2.add(x, Mat22.multiply(R, new Vec2(-h.x, h.y)));

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

        this.ctx.strokeStyle = color;

        this.ctx.beginPath();

        // Line from body1 center to its anchor
        this.ctx.moveTo(x1.x, x1.y);
        this.ctx.lineTo(p1.x, p1.y);

        // Line from body2 center to its anchor
        this.ctx.moveTo(x2.x, x2.y);
        this.ctx.lineTo(p2.x, p2.y);

        this.ctx.stroke();
    };
}
