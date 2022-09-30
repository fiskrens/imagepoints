
(function() {
    document.querySelectorAll('.image-wrapper').forEach((item) => {
        const pointlist = item.nextElementSibling
        console.log(pointlist)
        const imagep = item.ImagePoints({
            generateoffset: {
                active: true,
                // type: 'hourglass',
                radialoffset: 100,
                // factor: 0.7
            },
            editable: true,
            callbacks: {
                add: (point) => {
                    
                },
                move: () => {

                },
                modechange: (type) => {
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


        //imagep.addPoint(140, 140, null, null, 'Ola bandola', 'unique1234')
        const dataset = JSON.parse('[{"coords":{"x":175,"y":200.109375,"x2":164.46875,"y2":123.53125},"text":"Eyes colored copper to red, with horizontal pupils.","index":0,"uid":"unique1234"},{"coords":{"x":242,"y":212.125,"x2":244.71875,"y2":111.765625},"text":"Two large parallell parotoid glands on head.","index":1,"uid":"unique1234"},{"coords":{"x":334,"y":177.109375,"x2":352,"y2":108.0625},"text":"Warty texture with reddish to greenish brown. Juveniles and females usually more reddish colored than males.","index":2,"uid":null},{"coords":{"x":134.125,"y":283.640625,"x2":78.125,"y2":331.3125},"text":"Dark nuptial pads on males during breeding season, to help males grip female in amplexus.","index":3,"uid":null},{"coords":{"x":433.875,"y":331.0625,"x2":467.875,"y2":395.4375},"text":"Hind feet partially webbed with paired tubercles at articulations of toes.","index":4,"uid":null}]')
        imagep.setDataset(dataset)
        
        document.querySelector('.js-enable-add').addEventListener('click', (e) => {
            imagep.setCurrentTool('add')
        })

        document.querySelector('.js-get-dataset').addEventListener('click', (e) => {
            console.log(imagep.getDataset())
            console.log(JSON.stringify(imagep.getDataset()))
        })


        
    })
})();