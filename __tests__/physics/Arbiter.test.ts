import { Arbiter, Contact, Edges } from '../../src/physics/Arbiter';
import Body from '../../src/physics/Body';
import World from '../../src/physics/World';

const makeContact = (Pn = 0, Pt = 0, Pnb = 0): Contact => {
    const c = new Contact();
    c.Pn = Pn;
    c.Pt = Pt;
    c.Pnb = Pnb;
    return c;
};

describe('Edges', () => {
    test('flip() should swap in and out edges', () => {
        const edges = new Edges();
        edges.inEdge1 = 1;
        edges.outEdge1 = 2;
        edges.inEdge2 = 3;
        edges.outEdge2 = 4;

        edges.flip();

        expect(edges.inEdge1).toBe(3);
        expect(edges.outEdge1).toBe(4);
        expect(edges.inEdge2).toBe(1);
        expect(edges.outEdge2).toBe(2);
    });
});

describe('Arbiter', () => {
    let bodyA: Body;
    let bodyB: Body;
    let arbiter: Arbiter;

    beforeEach(() => {
        bodyA = new Body();
        bodyB = new Body();
        arbiter = new Arbiter(bodyA, bodyB);
    });

    test('update() non-matching contacts are simply inserted', () => {
        arbiter.numContacts = 1;
        arbiter.contacts[0] = makeContact(5, 6, 7);

        const newContacts = [makeContact(20)];
        arbiter.update(newContacts, 1);

        expect(arbiter.numContacts).toBe(1);
        expect(arbiter.contacts[0].Pn).toBe(5);
        expect(arbiter.contacts[0].Pt).toBe(6);
        expect(arbiter.contacts[0].Pnb).toBe(7);
    });

    test('update() matching contacts copy old impulses when warm starting is enabled', () => {
        arbiter.numContacts = 1;
        arbiter.contacts[0] = makeContact(3, 4, 5);

        const updated = makeContact(10);
        arbiter.update([updated], 1);

        expect(arbiter.numContacts).toBe(1);

        // Should copy old impulses
        expect(arbiter.contacts[0].Pn).toBe(3);
        expect(arbiter.contacts[0].Pt).toBe(4);
        expect(arbiter.contacts[0].Pnb).toBe(5);
    });

    test('update() matching contacts reset impulses when warm starting is disabled', () => {
        arbiter.numContacts = 1;
        arbiter.contacts[0] = makeContact(3, 4, 5);

        const updated = makeContact(10);
        World.warmStarting = false;
        arbiter.update([updated], 1);

        expect(arbiter.contacts[0].Pn).toBe(0);
        expect(arbiter.contacts[0].Pt).toBe(0);
        expect(arbiter.contacts[0].Pnb).toBe(0);
    });

    test('update() multiple contacts merged correctly', () => {
        arbiter.numContacts = 2;
        arbiter.contacts[0] = makeContact(10, 11, 12);
        arbiter.contacts[1] = makeContact(20, 21, 22);

        const newContacts = [
            makeContact(2), // matches old index 1
            makeContact(3), // new
        ];

        arbiter.update(newContacts, 2);

        expect(arbiter.numContacts).toBe(2);
    });

    // TODO: add unit tests on preStep method
});
