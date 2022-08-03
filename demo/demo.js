

//const banana = new ImagePoints('.image-wrapper', {})

document.querySelectorAll('.image-wrapper').forEach((item) => {
    const pointlist = item.nextElementSibling
    console.log(pointlist)
    const imagep = item.ImagePoints({
        callbacks: {
            add: (point) => {
                console.log('added point')
                console.log(point)
            },
            move: () => {

            },
            modechange: (type) => {
                console.log('mode change')
                if(type==='add') {
                    document.querySelector('.js-enable-add').classList.add('active')
                } else {
                    document.querySelector('.js-enable-add').classList.remove('active')
                }
            }
        },
        pointlist: pointlist
    })

    document.querySelector('.js-enable-add').addEventListener('click', (e) => {
        imagep.setCurrentTool('add')
    })
})


