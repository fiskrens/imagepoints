
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('.image-wrapper').forEach((item) => {
            item.querySelector('img').addEventListener('load', () => {
                const pointlist = item.nextElementSibling
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


                //imagep.addPoint(140, 140, null, null, 'Some text about the point shown in list', 'uniqueName1234')

                const jsonData = '[{"coords":{"x":263,"y":175,"x2":195.12992793788462,"y2":101.55850411189007},"coordsPercentage":{"x":39.84848484848485,"x2":29.565140596649186,"y":35.35353535353536,"y2":20.516869517553552},"text":"Something something","index":0,"uid":null},{"coords":{"x":401,"y":179,"x2":472.9663388752855,"y2":109.56768714144994},"coordsPercentage":{"x":60.75757575757576,"x2":71.66156649625538,"y":36.16161616161616,"y2":22.134886291202008},"text":"","index":1,"uid":null},{"coords":{"x":409,"y":321,"x2":482.21329956330425,"y2":389.1161711126945},"coordsPercentage":{"x":61.969696969696976,"x2":73.06262114595519,"y":64.84848484848484,"y2":78.60932749751403},"text":"","index":2,"uid":null},{"coords":{"x":263,"y":322,"x2":196.1311016953686,"y2":396.35422274171697},"coordsPercentage":{"x":39.84848484848485,"x2":29.716833590207365,"y":65.05050505050505,"y2":80.07156014984182},"text":"","index":3,"uid":null}]'
                const dataset = JSON.parse(jsonData)
                imagep.setDataset(dataset)
                
                document.querySelector('.js-enable-add').addEventListener('click', (e) => {
                    imagep.setCurrentTool('add')
                })

                document.querySelector('.js-get-dataset').addEventListener('click', (e) => {
                    console.log(imagep.getDataset())
                    console.log(JSON.stringify(imagep.getDataset()))
                })
            
            })
        })
    })
})();