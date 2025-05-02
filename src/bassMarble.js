class BassMarble extends Marble {
    constructor(x, y, r, speed) {
        super(x, y, r, speed); // Call the parent class constructor

        this.body.label = 'bass-marble';
        this.img = loadImage('img/bassMarble.png');

        this.color = 'black';

        const randomVelocity = Marble.getRandomVelocity(this.speed);
        Body.setVelocity(this.body, randomVelocity);

        this.body.collisionFilter = {
            category: bassMarbleCategory,
            mask: marbleCategory | worldCategory
        };
    }
}