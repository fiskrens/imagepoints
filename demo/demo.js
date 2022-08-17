

//const banana = new ImagePoints('.image-wrapper', {})

$(function() {

document.querySelectorAll('.image-wrapper').forEach((item) => {
    const pointlist = item.nextElementSibling
    console.log(pointlist)
    const imagep = item.ImagePoints({
        type: 'radial',
        callbacks: {
            add: (point) => {
                //console.log('added point')
                //console.log(point)
            },
            move: () => {

            },
            modechange: (type) => {
                //console.log('mode change')
                if(type==='add') {
                    document.querySelector('.js-enable-add').classList.add('active')
                } else {
                    document.querySelector('.js-enable-add').classList.remove('active')
                }
            },
            textchange: (point, from, to)  => {
                console.log(from, to)
            }
        },
        pointlist: pointlist
    })


    imagep.addPoint(340, 226, null, null, 'Ola bandola')
    // imagep.addPoint(600, 100, null, null, 'Ola bandola')
    // imagep.addPoint(600, 350, null, null, 'Ola bandola')
    // imagep.addPoint(150, 350, null, null, 'Ola bandola')
    


    console.log(imagep.points)

    document.querySelector('.js-enable-add').addEventListener('click', (e) => {
        imagep.setCurrentTool('add')
    })
})



})