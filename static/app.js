// resetting background gradient
function resetbg(element){
    if(element.hasClass("colored")){
        element.removeClass("colored");
        element.css({
            "background": "transparent"
        });
    }
}

// selected element for fullscreen mode
var selected = null;

// data to compare with and decide if background should be changed
var oldData = [0,0,0,0,0,0,0,0];

function parseData(d){
    for (var ch = 0; ch < d.length; ch++) {
        var element = $('#wl'+ch).parent();
        if(d[ch]>100){
            var wl = d[ch].toFixed(precision);
			var freq = (1e-12*299792458/(wl*1e-9)).toFixed(precision);
			// the channel from the json config file
			var c = $.grep(channels, function(e){ return (e.i == ch)}); 
			if(c.length == 0){
				continue; // channel not present in config file
			}
			if("background" in c[0]){
				if(!element.hasClass("colored")){
					element.addClass("colored");
				}
				element.css({"background": c[0].background});
			}
			if("target_THz" in c[0]){
				var detuning = (1e6*(freq - c[0].target_THz)).toFixed(0);
				$('#wl'+ch).html((detuning<=0?"":"+") + detuning + " MHz");
				if(Math.abs(detuning)< 10){
					element.css({"background": "#0A0"});
				}
			}else{
				$('#wl'+ch).html(freq + " THz");
			}

        }else{
            $('#wl'+ch).html("No data");
            oldData[ch] = d[ch];
            resetbg(element);
        }
    }
};

var ws;

function connect(){
    ws = new WebSocket(location.protocol.replace("http","ws")+"//"+location.host+location.pathname+"ws/");
    var connected = false;
    ws.onmessage = function(e) {
        if(!connected){
            $("#modal").fadeOut(200);
            connected = true;
        }
        parseData(JSON.parse(e.data));
    };
    ws.onclose = function(e){
        connected = false;
        $("#modal").fadeIn(200).css('display', 'flex');
        setTimeout(connect, 1000);
    };
}

connect();

// make wavelength value fullscreen
function resizeFont(){
	var w = $(document).width();
    if(selected == null){
        var maxh = $(".container > div").height();
    }else{
        var maxh = $(selected).height();
    }
	var fontsize = w/(precision+4);
    if(fontsize > maxh/2){
        fontsize = maxh/2;
    }
    if(selected != null){
        $(".container > div .data").css({
            "font-size": fontsize+"px",
            "line-height": "130%",
        });
    }else{
        $(".data").css({
            "font-size": fontsize+"px",
            "line-height": "130%",
        });
    }
}

// selecting channel for fullscreen mode
$(".container > div").on("click", function(){
	if(selected != this){
    	selected = this;
    	$(".container > div").hide();
    	$(this).show();
	}else{
		selected = null;
    	$(".container > div").show();
    	$(".container > div > .data").css({
    		"font-size": "",
    		"line-height": "",
    	});
	}
    resizeFont();
});

// changing font size on resize of the window
$(window).resize(function(){
	resizeFont();
});

parseData(data);
resizeFont();
