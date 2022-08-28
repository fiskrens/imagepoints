class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `{${this.x}, ${this.y}}`
    }

    multiply(value) {
        return new Vector2(this.x * value, this.y * value);
    }

    divide(value) {
        return new Vector2(this.x / value, this.y / value);
    }

    normalize() {
        return this.divide(this.magnitude()); 
    }

    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    magnitude() {
        return Math.sqrt(this.magnitudeSquared(this));
    }

    add(value) {
        return new Vector2(this.x + value.x, this.y + value.y)
    }

    subtract(value) {
        return new Vector2(this.x - value.x, this.y - value.y)
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }
}
