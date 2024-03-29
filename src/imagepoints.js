class ImagePoints {
    image = null
    points = []
    currentTool = ''
    options = {
        editable: true, 
        pointoffset: {x: 0, y: 0, x2: 0, y2: -50},
        generateoffset: {
            active: true,
            type: 'radial',
            radialoffset: 50,
            factor: 0.5
        },
        callbacks: {
            add: null,
            move: null,
            modechange: null,
            textchange: null
        },
        pointlist: null
    }
    generator = null
    
    constructor(element, options) {
        this.options = {...this.options, ...options, 
            generateoffset:{...this.options.generateoffset, ...options.generateoffset},
            callbacks:{...this.options.callbacks, ...options.callbacks},
            pointoffset:{...this.options.pointoffset, ...options.pointoffset},
        }
        this.initImage(element)
    }

    initImage(image) {
        image.addEventListener('click', (e) => {
            this.imageClicked(e)
        })

        image.style.position = 'relative'
        image.querySelector('img').classList.add('imgn-image')
        image.querySelector('img').setAttribute('draggable', false)
        this.points = []
        this.image = image
        this.currentTool = ''
        this.generator = this.createGenerator()
        
        if(!this.options.editable) { this.image.classList.add('imgp-static') }
    }

    createGenerator() {
        switch(this.options.generateoffset.type) {
            case 'radial':
                return new RadialPointGenerator(
                    new Vector2(this.image.clientWidth, this.image.clientHeight),
                    this.options.generateoffset.radialoffset
                )
            case 'hourglass':
                return new HourGlassPointGenerator(
                    new Vector2(this.image.clientWidth, this.image.clientHeight),
                    this.options.generateoffset.radialoffset,
                    this.options.generateoffset.factor
                )
            default:
            case 'offset':
                return new OffsetPointGenerator(
                    new Vector2(this.image.clientWidth, this.image.clientHeight),
                    this.options.pointoffset.x2,
                    this.options.pointoffset.y2
                )
        }
    }

    setCurrentTool(type) {
        if(type !== this.currentTool && typeof this.options.callbacks.modechange == 'function') { this.options.callbacks.modechange(type) }
        this.currentTool = type
        this.image.setAttribute('data-tooltype', type)
    }

    imageClicked(event) {
        const clickX =   event.offsetX //- this.image.offsetLeft
        const clickY =   event.offsetY //- this.image.offsetTop

        switch(this.currentTool) {
            default:
            case '':
                this.focusPointElement(event.target)
                break
            case 'add':
                if(event.target.classList.contains('imgn-image')) {
                    if(this.image.querySelector('.img-text textarea')) { return }
                    const x = (clickX+this.options.pointoffset.x)
                    const y = (clickY+this.options.pointoffset.y)
                    const point = this.addPoint(x, y)
                    this.setCurrentTool('')
                }
                break
            case 'remove':
                if(['imgp-point','imgp-value','imgp-point-tag','imgp-line'].some((val) => event.target.classList.contains(val))) {
                    const parent = this.findClosest(event.target, 'imgp-point-wrapper')
                    const point = parent.querySelector('.imgp-point')
                    const pointIndex = point.getAttribute('data-point')
                    this.removePoint(pointIndex)
                }
  
                break
        }
    }

    findClosest(el, className) {
        let parent = el.parentNode;
        while (parent) {
            if (parent.classList.contains(className)) {
                return parent
            }
            parent = parent.parentNode
        }
    } 

    focusPointElement(elem) {
        this.image.querySelectorAll('.imgp-point-wrapper').forEach(item => {
            item.classList.remove('focused')
        })

        const point = (elem.classList.contains('imgp-point')) ? this.points[elem.dataset.point] : this.points[elem.parentElement.dataset.point]
        if(point) {
            point.focusPoint()
        }
    }

    addPoint(x, y, x2 = null, y2 = null, text = '', uID = null) {
        if(this.options.generateoffset.active) {
            const generatedCoords = this.generator.generate(x, y)
            if(x2==null) { x2 = generatedCoords.x }
            if(y2==null) { y2 = generatedCoords.y }
        } else {
            if(x2==null) { x2 = x+this.options.pointoffset.x2 }
            if(y2==null) { y2 = y+this.options.pointoffset.y2 }
        }

        const options = {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            index: this.points.length,
            text: text,
            editable: this.options.editable,
            uid: uID
        }

        const point = new ImagePoint(this.image, options)
        this.points.push(point)
        this.addPointToList(point)
        point.line.refresh(point.coords)

        point.elems.point.addEventListener('pointtag_dragged', (e) => {
            point.coords.x = e.detail.x
            point.coords.y = e.detail.y
            point.line.refresh(point.coords)
        })
        point.elems.point.addEventListener('point_dragged', (e) => {
            point.coords.x2 = e.detail.x
            point.coords.y2 = e.detail.y
            point.line.refresh(point.coords)
        })

        if(typeof this.options.callbacks.add === 'function') { this.options.callbacks.add(point) }
        return point
    }

    addPointToList(point) {
        if(this.options.pointlist) {
            const elPointItem = document.createElement('li')
            elPointItem.dataset.index = point.index+1

            elPointItem.innerHTML = `
                <div class="imgp-point-list-text">${point.text}</div>
                <textarea class="imgp-point-list-textarea">${point.text.replace(/<br\s*[\/]?>/gi, "\n")}</textarea>
            ` 
            
            const text = elPointItem.querySelector('.imgp-point-list-text')
            const textarea = elPointItem.querySelector('.imgp-point-list-textarea')

            text.addEventListener('click', (e) => {
                if(!this.options.editable) { return false }
                elPointItem.classList.add('imgp-edit')
                textarea.focus()
            })

            textarea.addEventListener('blur', (e) => {
                if(typeof this.options.callbacks.textchange === 'function') { this.options.callbacks.textchange(point, point.text, textarea.value) }
                text.innerHTML = textarea.value.replace(/(?:\r\n|\r|\n)/g, '<br>')
                point.text = textarea.value
                elPointItem.classList.remove('imgp-edit')
            })

            this.options.pointlist.appendChild(elPointItem)
        }
    }

    removePoint(pointIndex) {
        pointIndex = parseInt(pointIndex)
        this.image.querySelector('.imgp-point[data-point="'+pointIndex+'"]').parentNode.remove()
        this.points.splice(pointIndex, 1)
        this.options.pointlist.querySelector('li[data-index="'+(parseInt(pointIndex)+1)+'"]').remove()
        this.shiftIndexes(pointIndex)
    }

    shiftIndexes(pointIndex) {
        this.points.forEach((point) => {
            const element = this.image.querySelector('.imgp-point[data-point="'+point.index+'"]')
            const listElement = this.options.pointlist.querySelector('li[data-index="'+(point.index+1)+'"]')
            
            if(point.index > pointIndex) {
                element.querySelector('.imgp-value').innerHTML = point.index // Index is 1 less than current value
                element.setAttribute('data-point', point.index-1)
                listElement.setAttribute('data-index', point.index)
                point.index = point.index-1
            }
        })


    }

    getDataset() {
        return this.points.map((item) => {
            return {
                coords: item.coords, 
                coordsPercentage: this.convertToPercentage(item.coords, this.image.offsetWidth, this.image.offsetHeight),
                text: item.text, 
                index: item.index,
                uid: item.uid
            }
        })
    }

    setDataset(dataset) {
        dataset.forEach((item) => {
            let coords = item.coords
            let {x, y, x2, y2} = item.coords
            
            if(item.coordsPercentage !== undefined) {
                ({x, y, x2, y2} = item.coordsPercentage)
                x = x.toString() + '%'
                y = y.toString() + '%'
                x2 = x2.toString() + '%'
                y2 = y2.toString() + '%'
            }
            this.addPoint(x, y, x2, y2, item.text, item.uid)
        })
    }

    convertToPercentage(coords, containerWidth, containerHeight) {
        return {
            x: coords.x / containerWidth * 100,
            x2: coords.x2 / containerWidth * 100,
            y: coords.y / containerHeight * 100,
            y2: coords.y2 / containerHeight * 100
        }
    }
}


class ImagePoint {
    image = null
    index = 0
    uid = null
    text = ''
    options = {}
    coords = {x: 0, y: 0, x2: 0, y2: 0 }
    elems = {
        main: null,
        point: null,
        pointTag: null,
        textarea: null,
        text: null,
        indextext: null,
        move: null,
        line: null
    }
    isInEdit = false
    isFocused = false

    constructor(image, options) {
        this.image = image
        this.index = options.index
        this.text = options.text
        this.options = options
        this.uid = options.uid

        this.coords = {}
        this.coordsPercentage = {}

        const coords = {x: options.x, y: options.y, x2: options.x2, y2: options.y2}
        if(coords.x.toString().includes('%')) {
            this.coordsPercentage = coords
            this.coords = this.convertPercentageToPixels(coords, this.image.offsetWidth, this.image.offsetHeight)
        } else {
            this.coords = coords
        }

        this.addPointDOM()

        this.changePointPixelsToPercentage()
        window.addEventListener('resize', () => {
            this.refreshCoords()
        })
    }

    addPointDOM() {
        const pointWrapper = document.createElement('div')
        pointWrapper.classList.add('imgp-point-wrapper')

        pointWrapper.innerHTML = `
            <div class="imgp-line"></div>
            <div class="imgp-point" style="top: ${this.coords.y2}px; left: ${this.coords.x2}px;" data-point="${this.index}">
                <div class="imgp-value">${this.index+1}</div>
            </div>
            <div class="imgp-point-tag" style="top: ${this.coords.y}px; left: ${this.coords.x}px;">
        `

        this.elems.main = this.image.appendChild(pointWrapper)
        this.elems.point = this.elems.main.querySelector('.imgp-point')
        this.elems.pointTag = this.elems.main.querySelector('.imgp-point-tag')
        this.line = new ImagePointLine(this.elems.main.querySelector('.imgp-line'), this.coords, this.image)

        this.enableDraggable(this.elems.point)
        this.enableDraggable(this.elems.pointTag, true)

        this.changePointPixelsToPercentage()
    }

    changePointPixelsToPercentage() {
        const coordsPoint = this.convertPixelsToPercentage(this.elems.point)
        const coordsEndpoint = this.convertPixelsToPercentage(this.elems.pointTag)

        this.coordsPercentage = {
            x: coordsEndpoint.x,
            y: coordsEndpoint.y,
            x2: coordsPoint.x,
            y2: coordsPoint.y
        }
    }

    enableDraggable(elem, endpoint = false) {
        const dragElem = new PointDraggable(this, elem, endpoint)
    }

    focusPoint() {
        this.elems.main.classList.add('focused')
    }

    unfocusPoint() {
        this.elems.main.classList.remove('focused')
    }

    getCurrentText() {
        let text = this.elems.text.innerHTML
        text = text.replace(/<br\s*[\/]?>/gi, "\n")
        return text
    }

    setCurrentText(text) {
        text = text.replace(/(?:\r\n|\r|\n)/g, '<br>')
        this.elems.text.innerHTML = text
    }
    
    savePoint() {
        this.setCurrentText(this.elems.textarea.value)
        this.elems.main.dataset.status = ''
        this.isInEdit = false
    }

    cancelPoint() {
        this.isInEdit = false
        this.elems.main.dataset.status = ''        
    }

    convertPixelsToPercentage(el) {
        if(el.style.left.includes('%') && el.style.top.includes('%')) {
            return {x: parseFloat(el.style.left.replace('%','')), y: parseFloat(el.style.top.replace('%',''))}
        }

        const elementLeft = el.style.left.replace('px','')
        const elementTop = el.style.top.replace('px','')
        const cWidth = el.parentElement.clientWidth
        const cHeight = el.parentElement.clientHeight
        const factorW = (elementLeft != 0 && cWidth != 0) ? (elementLeft/cWidth) : 0
        const factorH = (elementTop != 0 && cHeight != 0) ? (elementTop/cHeight) : 0

        el.style.left = `${factorW*100}%`
        el.style.top = `${factorH*100}%`

        return {x: factorW*100, y: factorH*100}
    }

    refreshCoords() {
        const height = this.image.offsetHeight
        const width = this.image.offsetWidth
        this.coords = this.convertPercentageToPixels(this.coordsPercentage, width, height)
    }

    convertPercentageToPixels(coords, containerWidth, containerHeight) {
        coords = this.removePercentageSigns(coords)
        return {
            x: coords.x / 100 * containerWidth,
            x2: coords.x2 / 100 * containerWidth,
            y: coords.y / 100 * containerHeight,
            y2: coords.y2 / 100 * containerHeight
        }
    }

    removePercentageSigns(obj) {
        const {x, y, x2, y2} = obj
        return {
            x: this.removePercentageSign(x), 
            y: this.removePercentageSign(y), 
            x2: this.removePercentageSign(x2),
            y2: this.removePercentageSign(y2)
        }
    }

    removePercentageSign(value) {
        return value.toString().replace('%','')
    }
}


class PointDraggable {
    point = null
    elemConstraint = null
    elem = null
    draggingActive = false
    coords = {}
    event = false

    constructor(point, elem, isEndpoint = false) {
        this.point = point
        this.elemConstraint = point.image
        this.elem = elem
        this.isEndpoint = isEndpoint
        this.event = new CustomEvent('point_dragged', {detail: {x: 0, y: 0}})
        this.eventTag = new CustomEvent('pointtag_dragged', {detail: {x: 0, y: 0}})

        this.bindEvents()
    }

    bindEvents() {
        this.elem.addEventListener('mousedown', (e) => {
            this.dragStart(e)
        })
        document.addEventListener('mouseup', (e) => {
            this.dragEnd(e)
        })
        document.addEventListener('dragend', (e) => {
            this.dragEnd(e)
        })
        document.addEventListener('mousemove', (e) => {
            this.mouseMove(e)
        })
    }

    mouseMove(e) {
        if(this.draggingActive) { this.dragging(e) }
    }

    dragStart(e) {
        this.draggingActive = true
    }

    dragEnd(e) {
        this.draggingActive = false
        this.point.changePointPixelsToPercentage()
    }

    dragging(e) {
        const imagePageRect = this.elemConstraint.getBoundingClientRect()
        const x = e.pageX - imagePageRect.left - window.scrollX
        const y = e.pageY - imagePageRect.top - window.scrollY
        const coords = this.dragElement(x, y)
        const event = (this.isEndpoint) ? this.eventTag : this.event
        this.dispatchDragEvent(event, coords)
    }

    dispatchDragEvent(event, coords) {
        event.detail.x = coords.x
        event.detail.y = coords.y
        this.point.elems.point.dispatchEvent(event)
    }

    dragElement(x, y) {
        const newCoords = this.getConstraint(x, y)
        this.elem.style.left = `${newCoords.x}px`
        this.elem.style.top = `${newCoords.y}px`
        return {x: newCoords.x, y: newCoords.y}
    }

    getConstraintCoords() {
        const pointElem = (this.isEndpoint) ? this.point.elems.pointTag : this.point.elems.point
        return {
            x: 0+(pointElem.offsetWidth/2),
            y: 0+(pointElem.offsetHeight/2),
            x2: this.elemConstraint.offsetWidth-(pointElem.offsetWidth/2),
            y2: this.elemConstraint.offsetHeight-(pointElem.offsetHeight/2)
        }
    }

    getConstraint(elemX, elemY) {
        const constraints = this.getConstraintCoords()
        const x = Math.min(Math.max(constraints.x, elemX), constraints.x2)
        const y = Math.min(Math.max(constraints.y, elemY), constraints.y2)
        return {x: x, y: y}
    }
}



class ImagePointLine {
    coords = {}
    constructor(element, coords, image) {
        this.element = element
        this.coords = coords
        this.image = image
        this.refresh(coords)
    }

    refresh(coords = null) {
        if(!coords) { coords = this.coords }
        this.pointA = new Vector2(coords.x, coords.y)
        this.pointB = new Vector2(coords.x2, coords.y2)
        this.direction = this.pointB.subtract(this.pointA)
        this.setCSS()
    }

    angleDeg() {
        return this.direction.angleDeg()
    }

    calcTop() {
        return (this.pointB.y - this.pointA.y)/2 + this.pointA.y
    }

    calcLeft() {
        return (this.pointB.x - this.pointA.x)/2 + this.pointA.x - this.direction.magnitude()/2
    }

    magnitude() {
        return this.direction.magnitude()
    }

    calcTopPercentage() {
        return this.calcTop() / this.image.offsetHeight * 100
    }

    calcLeftPercentage() {
        return this.calcLeft() / this.image.offsetWidth * 100
    }

    calcWidthPercentage() {
        return this.magnitude() / this.image.offsetWidth * 100
    }

    setCSS() {
        const angle = this.angleDeg()
        this.element.style["transform"] = 'rotate('+ angle +'deg)'
        this.element.style.top    = this.calcTopPercentage()+'%'
        this.element.style.left   = this.calcLeftPercentage()+'%'
        this.element.style.width  = this.calcWidthPercentage()+'%'
    }
}


Element.prototype.ImagePoints = function(options) {
    return new ImagePoints(this, options)
}