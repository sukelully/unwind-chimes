class Boundary {
    constructor(x, y, w, h, a = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        let options = {
            friction: 0,
            restitution: 1,
            angle: a,
            isStatic: true
        }
        this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);
        // this.body.collisionFilter = {
        //     category: worldCategory,
        //     mask: marbleCategory
        // }
        Composite.add(world, this.body);
    }

    draw() {
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        rect(0, 0, this.w, this.h);
        pop();
    }

    remove() {
        Composite.remove(world, this.body);
    }
}