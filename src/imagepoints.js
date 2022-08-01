


class ImagePoints {
    elems = null
    images = []
    options = {
        pointoffset: -15
    }
    

    constructor(selector, options) {
        this.elems = document.querySelectorAll(selector)
        this.options = {...this.options, ...options}
        
        this.elems.forEach(image => {
            this.initImage(image)
        })

        this.bindEvents()
    }

    initImage(image) {
        image.addEventListener('click', (e) => {
            this.imageClicked(image, e)
        })

        image.style.position = 'relative'
        image.querySelector('img').classList.add('imgn-image')
        image.points = []
        image.currentTool = ''
        this.images.push(image)
    }

    bindEvents() {
        document.querySelector('.js-enable-add').addEventListener('click', (e) => {
            this.images.forEach(image => {
                this.setCurrentTool(image, 'add')
            })
        })
    }

    setCurrentTool(image, type) {
        image.currentTool = type
        image.setAttribute('data-tooltype', type);
    }

    imageClicked(image, event) {
        const clickX =   event.pageX - image.offsetLeft
        const clickY =   event.pageY - image.offsetTop

        switch(image.currentTool) {
            default:
            case '':
                //Edit point
                // if(event.target.classList.contains('imgn-text')) {
                //     image.points[event.target.dataset.point].editPoint()
                // }
                // if(event.target.classList.contains('imgn-text-value')) {
                //     image.points[event.target.parentElement.dataset.point].editPoint()
                // }
                image.querySelectorAll('.imgp-point').forEach(item => {
                    item.classList.remove('focused')
                })

                //Focus point
                if(event.target.classList.contains('imgp-point')) {
                    image.points[event.target.dataset.point].focusPoint()
                }

                if(event.target.classList.contains('imgp-value')) {
                    image.points[event.target.parentElement.dataset.point].focusPoint()
                }
                break;
            case 'add':
                if(event.target.classList.contains('imgn-image')) {
                    if(image.querySelector('.img-text textarea')) { return; }
                    this.addPoint(image, (clickX+this.options.pointoffset), (clickY+this.options.pointoffset))
                    this.setCurrentTool(image, '')
                }
                break;
        }
    }

    addPoint(image, x, y) {
        const point = new ImagePoint(image, x, y, image.points.length)
        image.points.push(point)
    }


}

class ImagePoint {
    elem = null
    elemTextArea = null
    elemText = null
    elemMove = null
    isInEdit = false
    isFocused = false

    constructor(image, x, y, index) {
        this.image = image;
        this.addPoint(x, y, index)
    }

    addPoint(x, y, index) {
        const elPoint = document.createElement('div')
        elPoint.classList.add('imgp-point')
        elPoint.style.top = `${y}px`
        elPoint.style.left = `${x}px`
        /*elPoint.style.width = '150px'*/
        
        const elDivValue = document.createElement('div')
        elDivValue.classList.add('imgp-value')
        elDivValue.innerHTML = index+1
        
        // const elDivInput = document.createElement('textarea')
        // const elDivMove = document.createElement('div')
        // elDivMove.classList.add('imgn-move')
        // elDivMove.setAttribute('draggable', true)

        this.elemValue = elPoint.appendChild(elDivValue)



        const elAddLine = document.createElement('div')
        elAddLine.classList.add('imgp-point-addline')
        this.elemAddLine = elPoint.appendChild(elAddLine)

        $(this.elemAddLine).draggable({
            //handle: '.imgn-move',
            containment: '.image-wrapper',
            drag: (e, ui) => {
                this.elem.linex = ui.position.left
                this.elem.liney = ui.position.top
                this.refreshLine()
            }
        })


        // this.elemTextArea = elDiv.appendChild(elDivInput)
        // this.elemMove = elDiv.appendChild(elDivMove)

        const point = this.image.appendChild(elPoint)
        this.elem = point
        this.elem.dataset.point = index
        this.elem.x = x
        this.elem.y = y
        $(this.elem).append('<div class="line"></div>')
        
        $(this.elem).draggable({
            //handle: '.imgn-move',
            containment: 'parent',
            dragstart: (e, ui) => {
                this.elem.x = ui.position.left
                this.elem.y = ui.position.top
            },
            drag: (e, ui) => {
                const x = ui.position.left
                const y = ui.position.top

                const diffx = x-this.elem.x
                const diffy = y-this.elem.y

                
                this.elem.querySelector('.imgp-point-addline').style.left = `${this.elem.linex-diffx}px`
                this.elem.querySelector('.imgp-point-addline').style.top = `${this.elem.liney-diffy}px`
                

                this.elem.x = x
                this.elem.y = y
                this.elem.linex = this.elem.linex-diffx
                this.elem.liney = this.elem.liney-diffy

                this.refreshLine()
            },
            dragstop: () => {

            }
        })

        // $(this.elem).resizable({
        //     containment: 'parent',
        //     minWidth: 50,
        //     minHeight: 24,
        //     //helper: "ui-resizable-helper",
        //     handles: 'e'
        // });

        // this.elemTextArea.addEventListener('blur', (e) => {
        //     this.savePoint()
        // })
        // this.elemTextArea.addEventListener('keydown', (e) => {
        //     this.setCurrentText(e.currentTarget.value)
        // })
        // this.elemTextArea.addEventListener('keyup', (e) => {
        //     this.setCurrentText(e.currentTarget.value)
        // })
        // this.elemTextArea.addEventListener('keydown', (e) => {
        //     if(e.key === 'Escape') {
        //         this.cancelPoint()
        //     }
        // })


        // this.elemMove.addEventListener('dragstart', (e) => {
        //     e.dataTransfer.setData(format, 'Dragme');
        //     e.dataTransfer.effectAllowed = effect;
        // })
        // this.elemMove.addEventListener('drag', (e) => {
        //     if(e.screenX===0) { return}
        //     e.preventDefault();
        //     this.movePoint(e.clientX, e.clientY, e.layerX, e.layerY)
        // })
        // this.elemMove.addEventListener('dragend', (e) => {
        //     //console.log('dragstop');
        //     //console.log(e.clientX, e.clientY, e.layerX, e.layerY)
        //     this.movePoint(e.clientX, e.clientY, e.layerX, e.layerY)
        // })

        this.editPoint()
    }

    focusPoint() {
        this.elem.classList.add('focused')
        
    }

    unfocusPoint() {
        this.elem.classList.remove('focused')
    }

    movePoint(x,y,x2,y2) {
        console.log(x, y, x2, y2);
        this.elem.style.left = `${x}px`
        this.elem.style.top = `${y}px`
    }

    editPoint() {
        // if(this.isInEdit) { return }
        // this.elem.dataset.status = 'edit'

        // this.elemTextArea.value = this.getCurrentText()
        

        // this.elemTextArea.focus()
        // this.inEdit = true
    }

    getCurrentText() {
        let text = this.elemText.innerHTML
        text = text.replace(/<br\s*[\/]?>/gi, "\n")
        return text
    }

    setCurrentText(text) {
        text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
        console.log(text)
        this.elemText.innerHTML = text
    }
    
    savePoint() {
        this.setCurrentText(this.elemTextArea.value)
        this.elem.dataset.status = ''
        this.isInEdit = false
    }

    cancelPoint() {
        this.isInEdit = false
        this.elem.dataset.status = ''
    }

    refreshLine() {
        const from = this.elem
        const to = this.elemAddLine

        const pointA = {x: 15, y: 15}
        const pointB = {
            x: (this.elemAddLine.offsetLeft + this.elemAddLine.offsetWidth/2),
            y: (this.elemAddLine.offsetTop + this.elemAddLine.offsetHeight/2)
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
        const line = this.elem.querySelector('.line')
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