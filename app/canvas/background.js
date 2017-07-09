/**
 * Created by shubham on 9/7/17.
 */

jQuery(document).ready(function($){

    var windowXArray = [],
        windowYArray = [];

    for (var i = 0; i < $(window).innerWidth(); i++) {
        windowXArray.push(i);
    }

    for (var i = 0; i < $(window).innerHeight(); i++) {
        windowYArray.push(i);
    }

    function randomPlacement(array) {
        var placement = array[Math.floor(Math.random()*array.length)];
        return placement;
    }


    var canvas = oCanvas.create({
        canvas: '#canvas',
        background: '#2c3e50',
        fps: 60
    });

    setInterval(function(){

        var rectangle = canvas.display.ellipse({
            x: randomPlacement(windowXArray),
            y: randomPlacement(windowYArray),
            origin: { x: 'center', y: 'center' },
            radius: 0,
            fill: '#27ae60',
            opacity: 1
        });

        canvas.addChild(rectangle);

        rectangle.animate({
            radius: 10,
            opacity: 0
        }, {
            duration: '1000',
            easing: 'linear',
            callback: function () {
                this.remove();
            }
        });

    }, 100);

    $(window).resize(function(){
        canvas.width = $(window).innerWidth();
        canvas.height = $(window).innerHeight();
    });

    $(window).resize();

});