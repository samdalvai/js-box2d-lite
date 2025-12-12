import Mat22 from './math/Mat22';
import Vec2 from './math/Vec2';
import { Contact } from './physics/Arbiter';
import Body from './physics/Body';

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

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.canvas = canvas;
        this.ctx = ctx;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        return true;
    };

    static clearScreen = (): void => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    static drawLine = (x0: number, y0: number, x1: number, y1: number, color: string): void => {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    };

    static drawCircle = (x: number, y: number, radius: number, angle: number, color: string): void => {
        // Draw the circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        // Draw the line from center to circle edge at given angle
        const endX = x + Math.cos(angle) * radius;
        const endY = y + Math.sin(angle) * radius;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    };

    static drawFillCircle = (x: number, y: number, radius: number, color: string): void => {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    };

    static drawRect = (x: number, y: number, width: number, height: number, color: string): void => {
        const hw = width / 2;
        const hh = height / 2;

        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x - hw, y - hh);
        this.ctx.lineTo(x + hw, y - hh);
        this.ctx.lineTo(x + hw, y + hh);
        this.ctx.lineTo(x - hw, y + hh);
        this.ctx.closePath();
        this.ctx.stroke();
    };

    static drawFillRect = (x: number, y: number, width: number, height: number, color: string): void => {
        const hw = width / 2;
        const hh = height / 2;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - hw, y - hh, width, height);
    };

    static drawPolygon = (x: number, y: number, vertices: Vec2[], color: string): void => {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();

        if (vertices.length > 0) {
            this.ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                this.ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            this.ctx.closePath();
        }

        this.ctx.stroke();

        // draw the 1px center point like filledCircleColor(..., radius=1)
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    };

    static drawFillPolygon = (x: number, y: number, vertices: Vec2[], color: string): void => {
        if (vertices.length === 0) return;

        // Fill polygon
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Draw the 1px center point
        this.ctx.fillStyle = '#000000'; // black like 0xFF000000 in SDL
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    };

    static drawTexture = (
        x: number,
        y: number,
        width: number,
        height: number,
        rotation: number, // in radians
        texture: CanvasImageSource,
    ): void => {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(texture, -width / 2, -height / 2, width, height);
        this.ctx.restore();
    };

    static drawText = (
        text: string,
        x: number,
        y: number,
        fontSize: number = 20,
        fontFamily: string = 'Arial',
        color: string = 'white',
        align: CanvasTextAlign = 'center',
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

        this.ctx.strokeStyle = 'white'; // Make it changeable?
        this.ctx.beginPath();
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.lineTo(v3.x, v3.y);
        this.ctx.lineTo(v4.x, v4.y);
        this.ctx.lineTo(v1.x, v1.y);
        this.ctx.closePath();
        this.ctx.stroke();
    };
}

/*
Body and Joint rendering

TOOD: implement joint rendering
static void DrawJoint(Joint* joint)
{
	Body* b1 = joint->body1;
	Body* b2 = joint->body2;

	Mat22 R1(b1->rotation);
	Mat22 R2(b2->rotation);

	Vec2 x1 = b1->position;
	Vec2 p1 = x1 + R1 * joint->localAnchor1;

	Vec2 x2 = b2->position;
	Vec2 p2 = x2 + R2 * joint->localAnchor2;

	glColor3f(0.5f, 0.5f, 0.8f);
	glBegin(GL_LINES);
	glVertex2f(x1.x, x1.y);
	glVertex2f(p1.x, p1.y);
	glVertex2f(x2.x, x2.y);
	glVertex2f(p2.x, p2.y);
	glEnd();
}

*/
