


class ImagePoints {
    elems = null
    images = []
    options = {}
    

    constructor(selector, options) {
        this.elems = document.querySelectorAll(selector)
        this.options = options
        
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
                if(event.target.classList.contains('imgn-text')) {
                    image.points[event.target.dataset.point].editPoint()
                }
                if(event.target.classList.contains('imgn-text-value')) {
                    image.points[event.target.parentElement.dataset.point].editPoint()
                }

                break;
            case 'add':
                if(event.target.classList.contains('imgn-image')) {
                    if(image.querySelector('.img-text textarea')) { return; }
                    this.addPoint(image, clickX, clickY)
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
        // this.elemTextArea = elDiv.appendChild(elDivInput)
        // this.elemMove = elDiv.appendChild(elDivMove)

        const point = this.image.appendChild(elPoint)
        console.log(point);
        this.elem = point
        this.elem.dataset.point = index
        
        $(this.elem).draggable({
            //handle: '.imgn-move',
            containment: 'parent'
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

}