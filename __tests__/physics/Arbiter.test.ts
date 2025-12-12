import { Arbiter, Contact, FeaturePair } from '../../src/physics/Arbiter';
import Body from '../../src/physics/Body';
import World from '../../src/physics/World';

const makeContact = (value: number, Pn = 0, Pt = 0, Pnb = 0): Contact => {
    const c = new Contact();
    c.feature.value = value;
    c.Pn = Pn;
    c.Pt = Pt;
    c.Pnb = Pnb;
    return c;
};

describe('FeaturePair', () => {
    test('flip() should swap edges of a feature pair', () => {
        const fp = new FeaturePair();
        fp.e.inEdge1 = 1;
        fp.e.outEdge1 = 2;
        fp.e.inEdge2 = 3;
        fp.e.outEdge2 = 4;

        fp.flip();

        expect(fp.e.inEdge1).toBe(3);
        expect(fp.e.outEdge1).toBe(4);
        expect(fp.e.inEdge2).toBe(1);
        expect(fp.e.outEdge2).toBe(2);
    });
});

describe('Arbiter', () => {
    let bodyA: Body;
    let bodyB: Body;
    let arbiter: Arbiter;

    beforeEach(() => {
        bodyA = { id: 1, friction: 1 } as Body;
        bodyB = { id: 2, friction: 1 } as Body;
        arbiter = new Arbiter(bodyA, bodyB);
    });

    test('update() non-matching contacts are simply inserted', () => {
        arbiter.numContacts = 1;
        arbiter.contacts[0] = makeContact(10, 5, 6, 7);

        const newContacts = [makeContact(20)];
        arbiter.update(newContacts, 1);

        expect(arbiter.numContacts).toBe(1);
        expect(arbiter.contacts[0].feature.value).toBe(20);
        expect(arbiter.contacts[0].Pn).toBe(0);
        expect(arbiter.contacts[0].Pt).toBe(0);
        expect(arbiter.contacts[0].Pnb).toBe(0);
    });

    test('update() matching contacts copy old impulses when warm starting is enabled', () => {
        arbiter.numContacts = 1;
        arbiter.contacts[0] = makeContact(10, 3, 4, 5);

        const updated = makeContact(10);
        arbiter.update([updated], 1);

        expect(arbiter.numContacts).toBe(1);
        expect(arbiter.contacts[0].feature.value).toBe(10);

        // Should copy old impulses
        expect(arbiter.contacts[0].Pn).toBe(3);
        expect(arbiter.contacts[0].Pt).toBe(4);
        expect(arbiter.contacts[0].Pnb).toBe(5);
    });

    test('update() matching contacts reset impulses when warm starting is disabled', () => {
        arbiter.numContacts = 1;
        arbiter.contacts[0] = makeContact(10, 3, 4, 5);

        const updated = makeContact(10);
        World.warmStarting = false;
        arbiter.update([updated], 1);

        expect(arbiter.contacts[0].Pn).toBe(0);
        expect(arbiter.contacts[0].Pt).toBe(0);
        expect(arbiter.contacts[0].Pnb).toBe(0);
    });

    test('update() multiple contacts merged correctly', () => {
        arbiter.numContacts = 2;
        arbiter.contacts[0] = makeContact(1, 10, 11, 12);
        arbiter.contacts[1] = makeContact(2, 20, 21, 22);

        const newContacts = [
            makeContact(2), // matches old index 1
            makeContact(3), // new
        ];

        arbiter.update(newContacts, 2);

        expect(arbiter.contacts[0].feature.value).toBe(2); // matched, replaced
        expect(arbiter.contacts[1].feature.value).toBe(3); // new

        expect(arbiter.numContacts).toBe(2);
    });

    // TODO: add unit tests on preStep method
});
