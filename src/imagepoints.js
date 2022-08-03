class ImagePoints {
    image = null
    points = []
    currentTool = ''
    options = {
        pointoffset: {x: 0, y: -20},
        callbacks: {
            add: null,
            move: null,
            modechange: null
        },
        pointlist: null
    }
    
    constructor(element, options) {
        this.options = {...this.options, ...options}
        this.initImage(element)
        this.bindEvents()
    }

    initImage(image) {
        image.addEventListener('click', (e) => {
            this.imageClicked(e)
        })

        image.style.position = 'relative'
        image.querySelector('img').classList.add('imgn-image')
        this.points = []
        this.image = image
        this.currentTool = ''
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
                this.image.querySelectorAll('.imgp-point-wrapper').forEach(item => {
                    item.classList.remove('focused')
                })
                //Focus point
                if(event.target.classList.contains('imgp-point')) {
                    this.points[event.target.dataset.point].focusPoint()
                }

                if(event.target.classList.contains('imgp-value')) {
                    this.points[event.target.parentElement.dataset.point].focusPoint()
                }
                break;
            case 'add':
                if(event.target.classList.contains('imgn-image')) {
                    if(this.image.querySelector('.img-text textarea')) { return; }
                    const x = (clickX+this.options.pointoffset.x)
                    const y = (clickY+this.options.pointoffset.y)
                    const point = this.addPoint(x, y)
                    point.refreshLine()
                    this.setCurrentTool('')
                    if(typeof this.options.callbacks.add === 'function') { this.options.callbacks.add(point) }
                }
                break;
        }
    }

    addPoint(x, y, x2 = '', y2 = '', text = '') {
        const options = {
            x: x,
            y: y,
            index: this.points.length,
            text: text
        }
        const point = new ImagePoint(this.image, options)
        this.points.push(point)
        this.addPointToList(point)
        return point
    }

    addPointToList(point) {
        if(this.options.pointlist) {
            const elPointItem = document.createElement('li')
            elPointItem.dataset.index = point.index+1
            elPointItem.innerHTML = ''
            
            const elPointItemText = document.createElement('div')
            elPointItemText.classList.add('imgp-point-list-text')
            const text = elPointItem.appendChild(elPointItemText)

            const elPointItemTextarea = document.createElement('textarea')
            elPointItemTextarea.classList.add('imgp-point-list-textarea')
            const textarea = elPointItem.appendChild(elPointItemTextarea)

            text.addEventListener('click', (e) => {
                elPointItem.classList.add('imgp-edit')
                textarea.focus()
            })

            textarea.addEventListener('blur', (e) => {
                text.innerHTML = textarea.value
                elPointItem.classList.remove('imgp-edit')
            })

            this.options.pointlist.appendChild(elPointItem)
        }
    }
}

class ImagePoint {
    image = null
    index = 0
    text = ''
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
        this.addPoint(options.x, options.y, options.x2, options.y2)

        window.addEventListener('resize', () => {
            //this.resizePixelValues(this.elem)
            //this.resizePixelValues(this.elems.line)
            this.refreshLine()
        })
    }

    addPoint(x, y, x2 = null, y2 = null) {
        if(x2==null) { x2 = x }
        if(y2==null) { y2 = y+25 }

        //Main
        const elMain = document.createElement('div')
        elMain.classList.add('imgp-point-wrapper')

        //Point
        const elPoint = document.createElement('div')
        elPoint.classList.add('imgp-point')
        elPoint.style.top = `${y}px`
        elPoint.style.left = `${x}px`

        this.elems.point = elMain.appendChild(elPoint)
        this.elems.point.dataset.point = this.index
        this.elems.point.x = x
        this.elems.point.y = y
        
        //Point - indexText
        const elIndexText = document.createElement('div')
        elIndexText.classList.add('imgp-value')
        elIndexText.innerHTML = this.index+1
        this.elems.indextext = elPoint.appendChild(elIndexText)

        //Endpoint
        const elLineEndPoint = document.createElement('div')
        this.elems.lineendpoint = elMain.appendChild(elLineEndPoint)
        this.elems.lineendpoint.classList.add('imgp-point-addline')
        this.elems.lineendpoint.style.top = `${y2}px`
        this.elems.lineendpoint.style.left = `${x2}px`

        $(this.elems.lineendpoint).draggable({
            containment: 'parent',
            drag: (e, ui) => {
                const x = ui.position.left
                const y = ui.position.top
                const left = x+(this.elems.lineendpoint.clientWidth/2)
                const top = y+(this.elems.lineendpoint.clientHeight/2)
                ui.position.left = left
                ui.position.top = top
                this.elems.lineendpoint.x = x
                this.elems.lineendpoint.y = y
                this.refreshLine(null, {x: left, y: top})
            },
            stop: () => {
                this.convertPixelsToPercentage(this.elems.lineendpoint)
                this.refreshLine()
            }
        })

        this.elems.main = this.image.appendChild(elMain)

        //Line
        const elLine = document.createElement('div')
        elLine.classList.add('imgp-line')
        this.elems.line = this.elems.main.appendChild(elLine)


        
        $(this.elems.point).draggable({
            //handle: '.imgn-move',
            containment: 'parent',
            start: (e, ui) => {
                this.elems.point.x = ui.position.left
                this.elems.point.y = ui.position.top
            },
            drag: (e, ui) => {
                const x = ui.position.left
                const y = ui.position.top
                const left = x+(this.elems.point.clientWidth/2)
                const top = y+(this.elems.point.clientHeight/2)
                ui.position.left = left
                ui.position.top = top
                this.elems.point.x = x
                this.elems.point.y = y
                this.refreshLine({x: left, y: top})
            },
            stop: (e, ui) => {
                this.convertPixelsToPercentage(this.elems.point)
                this.refreshLine()
            }
        })

        this.convertPixelsToPercentage(this.elems.point)
        this.convertPixelsToPercentage(this.elems.lineendpoint)
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

        let CA   = Math.abs(pointB.y - pointA.y)
        let CO   = Math.abs(pointB.x - pointA.x)
        let H    = Math.sqrt(CA*CA + CO*CO)
        let ANG  = 180 / Math.PI * Math.acos( CA/H )

        let top = (pointB.y > pointA.y) ? ((pointB.y-pointA.y)/2 + pointA.y) : ((pointA.y-pointB.y)/2 + pointB.y)
        let left = (pointB.x > pointA.x) ? ((pointB.x-pointA.x)/2 + pointA.x) : ((pointA.x-pointB.x)/2 + pointB.x)
        top-= H/2;

        if(
            (pointA.y < pointB.y && pointA.x < pointB.x) || 
            (pointB.y < pointA.y && pointB.x < pointA.x) || 
            (pointA.y > pointB.y && pointA.x > pointB.x) || 
            (pointB.y > pointA.y && pointB.x > pointA.x)
        ){
            ANG *= -1;
        }
        
        this.setLineCSS(ANG, top, left, H)
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