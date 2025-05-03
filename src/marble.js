class Marble {
    constructor(x, y, r, speed) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = speed;
        this.color = Marble.getRandomColor();
        this.img = loadImage('img/marble.png');

        let options = {
            friction: 0,
            frictionAir: 0,
            restitution: 1,
            label: 'marble',
        };
        this.body = Bodies.circle(this.x, this.y, this.r, options);
        this.body.collisionFilter = {
            category: marbleCategory,
            mask: worldCategory | bassMarbleCategory
        }
        Composite.add(world, this.body);

        const randomVelocity = Marble.getRandomVelocity(this.speed);
        Body.setVelocity(this.body, randomVelocity);
    }

    // Get random color for marble
    static getRandomColor() {
        const colors = ['#d2f1e4', '#fbcaef', '#acf39d', '#f2dc5d', '#ffb997', '#157a63', '#499f68', '#77b28c', '#87255b', '#7dd181', '#8075ff', '#437f97', '#ffb30f'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static getRandomVelocity(speed) {
        const maxSpeed = speed;
        const vx = (Math.random() - 0.5) * 2 * maxSpeed;
        const vy = (Math.random() - 0.5) * 2 * maxSpeed;
        return { x: vx, y: vy };
    }

    // Draw marble on screen
    draw() {
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(-angle * 0.8);
        imageMode(CENTER);
        image(this.img, 0, 0, this.r*2, this.r*2);
        pop();
        
        // Prevent marbles from losing enough speed to stop
        if (Body.getSpeed(this.body) < this.speed) {
            Body.setSpeed(this.body, this.speed);
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }
    
    // Remove marble from world
    remove() {
        Composite.remove(world, this.body);
    }
}