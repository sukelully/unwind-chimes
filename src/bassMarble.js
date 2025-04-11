class BassMarble extends Marble {
    constructor(x, y, r) {
        super(x, y, r); // Call the parent class constructor

        this.body.label = 'bass-marble';
        this.img = loadImage('img/marble.png');

        this.color = 'black';

        const randomVelocity = Marble.getRandomVelocity();
        Body.setVelocity(this.body, randomVelocity);

        this.body.collisionFilter = {
            category: bassMarbleCategory,
            mask: marbleCategory | worldCategory
        };
    }
}