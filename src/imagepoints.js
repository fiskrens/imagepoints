


class ImagePoints {
    //elems = null
    //images = []
    //elem = null
    image = null
    points = []
    currentTool = ''
    options = {
        pointoffset: {x: 0, y: -20}
    }
    

    constructor(element, options) {
        //this.elems = document.querySelectorAll(selector)
        this.options = {...this.options, ...options}
        
        //this.image = 
        this.initImage(element)
        
        // this.elems.forEach(image => {
        //     this.initImage(image)
        // })

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
        document.querySelector('.js-enable-add').addEventListener('click', (e) => {
            this.setCurrentTool('add')
        })
    }

    setCurrentTool(type) {
        this.currentTool = type
        this.image.setAttribute('data-tooltype', type);
    }

    imageClicked(event) {
        const clickX =   event.pageX - this.image.offsetLeft
        const clickY =   event.pageY - this.image.offsetTop
        console.log(event, this.currentTool, event.target.classList)

        switch(this.currentTool) {
            default:
            case '':
                this.image.querySelectorAll('.imgp-point-wrapper').forEach(item => {
                    item.classList.remove('focused')
                })
                //Focus point
                if(event.target.classList.contains('imgp-point')) {
                    console.log(this.points[event.target.dataset.point])
                    this.points[event.target.dataset.point].focusPoint()
                }

                if(event.target.classList.contains('imgp-value')) {
                    console.log(this.points[event.target.parentElement.dataset.point])
                    this.points[event.target.parentElement.dataset.point].focusPoint()
                }
                break;
            case 'add':
                if(event.target.classList.contains('imgn-image')) {
                    if(this.image.querySelector('.img-text textarea')) { return; }
                    const x = (clickX+this.options.pointoffset.x)
                    const y = (clickY+this.options.pointoffset.y)
                    this.addPoint(x, y)
                    this.setCurrentTool('')
                }
                break;
        }
    }

    addPoint(x, y) {
        const point = new ImagePoint(this.image, x, y, this.points.length)
        this.points.push(point)
    }


}

class ImagePoint {
    image = null
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


    constructor(image, x, y, index) {
        this.image = image;
        this.addPoint(x, y, index)

        window.addEventListener('resize', () => {
            //this.resizePixelValues(this.elem)
            //this.resizePixelValues(this.elems.line)
            this.refreshLine()
        })
    }

    addPoint(x, y, index) {
        //Main
        const elMain = document.createElement('div')
        elMain.classList.add('imgp-point-wrapper')

        //Point
        const elPoint = document.createElement('div')
        elPoint.classList.add('imgp-point')
        elPoint.style.top = `${y}px`
        elPoint.style.left = `${x}px`

        this.elems.point = elMain.appendChild(elPoint)
        this.elems.point.dataset.point = index
        this.elems.point.x = x
        this.elems.point.y = y
        
        //Point - indexText
        const elIndexText = document.createElement('div')
        elIndexText.classList.add('imgp-value')
        elIndexText.innerHTML = index+1
        this.elems.indextext = elPoint.appendChild(elIndexText)




        //Endpoint
        const elLineEndPoint = document.createElement('div')
        this.elems.lineendpoint = elMain.appendChild(elLineEndPoint)
        this.elems.lineendpoint.classList.add('imgp-point-addline')
        this.elems.lineendpoint.style.top = `${y+25}px`
        this.elems.lineendpoint.style.left = `${x}px`

        $(this.elems.lineendpoint).draggable({
            containment: 'parent',
            drag: (e, ui) => {
                const x = ui.position.left
                const y = ui.position.top
                ui.position.left = x+(this.elems.lineendpoint.clientWidth/2)
                ui.position.top = y+(this.elems.lineendpoint.clientHeight/2)
                this.elems.lineendpoint.x = x
                this.elems.lineendpoint.y = y
                this.refreshLine()
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
                ui.position.left = x+(this.elems.point.clientWidth/2)
                ui.position.top = y+(this.elems.point.clientHeight/2)
                this.elems.point.x = x
                this.elems.point.y = y
                this.refreshLine()
            },
            stop: (e, ui) => {
                this.convertPixelsToPercentage(this.elems.point)
                this.refreshLine()
            }
        })

        // $(this.elem).resizable({
        //     containment: 'parent',
        //     minWidth: 50,
        //     minHeight: 24,
        //     //helper: "ui-resizable-helper",
        //     handles: 'e'
        // });

        // this.elems.textarea.addEventListener('blur', (e) => {
        //     this.savePoint()
        // })
        // this.elems.textarea.addEventListener('keydown', (e) => {
        //     this.setCurrentText(e.currentTarget.value)
        // })
        // this.elems.textarea.addEventListener('keyup', (e) => {
        //     this.setCurrentText(e.currentTarget.value)
        // })
        // this.elems.textarea.addEventListener('keydown', (e) => {
        //     if(e.key === 'Escape') {
        //         this.cancelPoint()
        //     }
        // })


        // this.elems.move.addEventListener('dragstart', (e) => {
        //     e.dataTransfer.setData(format, 'Dragme');
        //     e.dataTransfer.effectAllowed = effect;
        // })
        // this.elems.move.addEventListener('drag', (e) => {
        //     if(e.screenX===0) { return}
        //     e.preventDefault();
        //     this.movePoint(e.clientX, e.clientY, e.layerX, e.layerY)
        // })
        // this.elems.move.addEventListener('dragend', (e) => {
        //     //console.log('dragstop');
        //     //console.log(e.clientX, e.clientY, e.layerX, e.layerY)
        //     this.movePoint(e.clientX, e.clientY, e.layerX, e.layerY)
        // })

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
        console.log(text)
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

        // const factorW = (elementLeft/cWidth)
        // const factorH = (elementTop/cHeight)

        el.style.left = `${factorW*100}%`
        el.style.top = `${factorH*100}%`
        console.log(factorW, factorH)
    }

    // resizePixelValues(el) {
    //     const factorW = el.dataset.factor.left
    //     const factorH = el.dataset.factor.top

    // }

    refreshLine() {
        const from = this.elems.point
        const to = this.elems.lineendpoint

        const pointA = {
            x: from.offsetLeft,
            y: from.offsetTop
        }
        const pointB = {
            x: to.offsetLeft,
            y: to.offsetTop
        }
        console.log(pointA, pointB)

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