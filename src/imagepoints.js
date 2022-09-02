class ImagePoints {
    image = null
    points = []
    currentTool = ''
    options = {
        editable: true, 
        pointoffset: {x: 0, y: 0, x2: 0, y2: -50},
        generateoffset: {
            active: true,
            type: 'hourglass',
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
        this.bindEvents()
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
        
        if(!this.options.editable) { this.image.classList.add('imgp-static'); }
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

    bindEvents() {
        
    }

    setCurrentTool(type) {
        if(type !== this.currentTool && typeof this.options.callbacks.modechange == 'function') { this.options.callbacks.modechange(type) }
        this.currentTool = type
        this.image.setAttribute('data-tooltype', type);
    }

    imageClicked(event) {
        const clickX =   event.pageX - this.image.offsetLeft
        const clickY =   event.pageY - this.image.offsetTop

        switch(this.currentTool) {
            default:
            case '':
                this.focusPointElement(event.target)
                break;
            case 'add':
                if(event.target.classList.contains('imgn-image')) {
                    if(this.image.querySelector('.img-text textarea')) { return; }
                    const x = (clickX+this.options.pointoffset.x)
                    const y = (clickY+this.options.pointoffset.y)
                    const point = this.addPoint(x, y)
                    this.setCurrentTool('')
                }
                break;
        }
    }

    focusPointElement(elem) {
        this.image.querySelectorAll('.imgp-point-wrapper').forEach(item => {
            item.classList.remove('focused')
        })

        const point = (elem.classList.contains('imgp-point')) ? this.points[elem.dataset.point] : this.points[elem.parentElement.dataset.point];
        if(point) {
            point.focusPoint();
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
        point.refreshLine()
        if(typeof this.options.callbacks.add === 'function') { this.options.callbacks.add(point); }
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
                if(!this.options.editable) { return false; }
                elPointItem.classList.add('imgp-edit')
                textarea.focus()
            })

            textarea.addEventListener('blur', (e) => {
                if(typeof this.options.callbacks.textchange === 'function') { this.options.callbacks.textchange(point, point.text, textarea.value); }
                text.innerHTML = textarea.value.replace(/(?:\r\n|\r|\n)/g, '<br>');
                point.text = textarea.value
                elPointItem.classList.remove('imgp-edit')
            })

            this.options.pointlist.appendChild(elPointItem)
        }
    }

    getDataset() {
        return this.points.map((item) => {
            return {
                coords: item.coords, 
                text: item.text, 
                index: item.index,
                uid: item.uid
            }
        })
    }

    setDataset(dataset) {
        dataset.forEach((item) => {
            this.addPoint(item.coords.x, item.coords.y, item.coords.x2, item.coords.y2, item.text, item.uid);
        })
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
        textarea: null,
        text: null,
        indextext: null,
        move: null,
        lineendpoint: null,
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
        this.coords = {x: options.x, y: options.y, x2: options.x2, y2: options.y2}
        this.addPoint(options.x, options.y, options.x2, options.y2)

        window.addEventListener('resize', () => {
            this.refreshLine()
        })
    }

    addPoint(x, y, x2, y2) {
        const pointWrapper = document.createElement('div')
        pointWrapper.classList.add('imgp-point-wrapper')

        pointWrapper.innerHTML = `
            <div class="imgp-line"></div>
            <div class="imgp-point" style="top: ${y2}px; left: ${x2}px;" data-point="${this.index}">
                <div class="imgp-value">${this.index+1}</div>
            </div>
            <div class="imgp-point-addline" style="top: ${y}px; left: ${x}px;">
        `

        this.elems.main = this.image.appendChild(pointWrapper)
        this.elems.point = this.elems.main.querySelector('.imgp-point')
        this.elems.lineendpoint = this.elems.main.querySelector('.imgp-point-addline')

        this.enableDraggable(this.elems.point)
        this.enableDraggable(this.elems.lineendpoint, true)

        this.convertPixelsToPercentage(this.elems.point)
        this.convertPixelsToPercentage(this.elems.lineendpoint)
    }

    enableDraggable(elem, endpoint = false) {
        $(elem).draggable({
            containment: 'parent',
            start: (e, ui) => {
                if(!this.options.editable) { return false; }
            },
            drag: (e, ui) => {
                elem.x = ui.position.left
                elem.y = ui.position.top
                ui.position.left = elem.x+(elem.clientWidth/2)
                ui.position.top = elem.y+(elem.clientHeight/2)
                if(endpoint) {
                    this.coords.x = ui.position.left
                    this.coords.y = ui.position.top
                    this.refreshLine(null, {x: ui.position.left, y: ui.position.top})
                } else {
                    this.coords.x2 = ui.position.left
                    this.coords.y2 = ui.position.top
                    this.refreshLine({x: ui.position.left, y: ui.position.top})
                }
            },
            stop: () => {
                this.convertPixelsToPercentage(elem)
                this.refreshLine()
            }
        })
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
        text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
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
        const elementLeft = el.style.left.replace('px','')
        const elementTop = el.style.top.replace('px','')
        const cWidth = el.parentElement.clientWidth
        const cHeight = el.parentElement.clientHeight
        const factorW = (elementLeft != 0 && cWidth != 0) ? (elementLeft/cWidth) : 0
        const factorH = (elementTop != 0 && cHeight != 0) ? (elementTop/cHeight) : 0

        el.style.left = `${factorW*100}%`
        el.style.top = `${factorH*100}%`
    }

    refreshLine(pA = null, pB = null) {
        const from = this.elems.point
        const to = this.elems.lineendpoint

        const pointA = pA ?? {
            x: from.offsetLeft,
            y: from.offsetTop
        }
        const pointB = pB ?? {
            x: to.offsetLeft,
            y: to.offsetTop
        }

        const pos = new Vector2(pointB.x, pointB.y)
        const direction = pos.subtract(pointA)
        const hypotenuse = direction.magnitude()
        let angle = (Math.PI/2 + direction.angle()) * 180/Math.PI
        const top = ((pointB.y-pointA.y)/2 + pointA.y)-hypotenuse/2
        const left = ((pointB.x-pointA.x)/2 + pointA.x)

        this.setLineCSS(angle, top, left, hypotenuse)
    }

    setLineCSS(angle, top, left, height) {
        const line = this.elems.main.querySelector('.imgp-line')
        line.style["-webkit-transform"] = 'rotate('+ angle +'deg)';
        line.style["-moz-transform"] = 'rotate('+ angle +'deg)';
        line.style["-ms-transform"] = 'rotate('+ angle +'deg)';
        line.style["-o-transform"] = 'rotate('+ angle +'deg)';
        line.style["-transform"] = 'rotate('+ angle +'deg)';
        line.style.top    = top+'px';
        line.style.left   = left+'px';
        line.style.height = height + 'px';
    }
}

Element.prototype.ImagePoints = function(options) {
    return new ImagePoints(this, options)
}