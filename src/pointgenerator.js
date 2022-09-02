class OffsetPointGenerator {
    constructor(size, xOffset, yOffset) {
        this.center = size.divide(2);
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    generate(x, y) {
        let pos = new Vector2(x, y)
        let direction = pos.subtract(this.center)
        return pos.add(new Vector2(this.xOffset, -Math.sign(direction.y) * this.yOffset))
    }

    toString() {
        return `RadialPointGenerator{ size = ${this.size}, offset = ${this.offset} }`
    }
}

class RadialPointGenerator {
    constructor(size, offset) {
        this.size = size;
        this.offset = offset;
    }

    generate(x, y) {
        let pos = new Vector2(x, y)
        let center = this.size.divide(2)
        let direction = pos.subtract(center).normalize().multiply(this.offset)

        return pos.add(direction)
    }

    toString() {
        return `RadialPointGenerator{ size = ${this.size}, offset = ${this.offset} }`
    }
}

class HourGlassPointGenerator {
    constructor(size, offset, factor) {
        this.center = size.divide(2);
        this.offset = offset;
        this.factor = Math.min(Math.max(factor, 0), 1)
    }

    generate(x, y) {
        let pos = new Vector2(x, y)
        let direction = pos.subtract(this.center)
        let angle = Math.PI / 2 - Math.atan2(direction.x, Math.abs(direction.y)) * this.factor
        let delta = new Vector2(Math.cos(angle), Math.sign(direction.y) * Math.sin(angle))
        return pos.add(delta.multiply(this.offset))
    }

    toString() {
        return `HourGlassPointGenerator{ center = ${this.center}, offset = ${this.offset}, factor = ${this.factor} }`
    }
}
