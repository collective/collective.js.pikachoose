/*    08/24/2010
		PikaChoose
	Jquery plugin for photo galleries
    Copyright (C) 2010 Jeremy Fry

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function($) {
    /**
     * Creates a slideshow for all matched elements.
     *
     * @example $("#pikame").PikaChoose();
     * @input needed <ul id="pikame"><li><img src="first.jpg"><span>Caption</span></li><li><img src="second.jpg"><span>Caption</span></li></ul>
     *
     * @method PikaChoose
     * @return $
     * @param o {Hash|String} A set of key/value pairs to set as configuration properties or a method name to call on a formerly created instance.
     */
 	var defaults = {
		autoPlay: true,
		speed: 5000,
		text: { play: "", stop: "", previous: "Previous", next: "Next" },
		transition:[0],
		showCaption: true,
		IESafe: true
	};
   
    $.fn.PikaChoose = function(o) {
		return this.each(function() {
			$(this).data('pikachoose', new $pc(this, o));
		});
	}
	
	/**
     * The PikaChoose object.
     *
     * @constructor
     * @class pikachoose
     * @param e {HTMLElement} The element to create the carousel for.
     * @param o {Object} A set of key/value pairs to set as configuration properties.
     * @cat Plugins/PikaChoose
     */
    $.PikaChoose = function(e, o) {
		this.options    = $.extend({}, defaults, o || {});
		this.list     	= null;
		this.image  	= null;
		this.anchor		= null;
		this.caption	= null;
		this.imgNav		= null;
		this.imgPlay 	= null;
		this.imgPrev	= null;
		this.imgNext 	= null;
		this.textNext	= null;
		this.textPrev	= null;
		this.previous  = null;
		this.next 		= null;
		this.aniDiv		= null;
		this.thumbs		= null;
		this.transition= null;
		this.active		= null;
		this.animating	= false;
		if (e.nodeName == 'UL' || e.nodeName == 'OL') {
            this.list = $(e);
            this.build();
            this.bindEvents();
        }else{
        	return;
        }
		
		var y = 0;
		var x = 0;
		for(var t = 0; t<25;t++)
		{
			var a = '<div col="'+y+'" row="'+x+'"></div>';
			this.aniDiv.append(a);
			y++
			if(y == 5)
			{
				x++;
				y=0;
			}
		}

    }//end PikaChoose function(e, o)
    
    var $pc = $.PikaChoose;
        $pc.fn = $pc.prototype = {
        pikachoose: '4.0.3'
    };

    $pc.fn.extend = $pc.extend = $.extend;

    $pc.fn.extend({
        /**
         * Builds the gallery structure.
         *
         * @method build
         * @return undefined
         */
        build: function() {
        	this.step 		= 0; //transition step count
       	//create the structure for pikachoose
			this.wrap 		= $("<div class='pika-image'></div>").insertBefore(this.list);
			this.image 		= $("<img>").appendTo(this.wrap);
			this.anchor		= this.image.wrap("<a>").parent();
			this.imgNav 	= $("<div class='pika-imgnav'></div>").insertAfter(this.anchor);
			this.imgPlay 	= $("<a></a>").appendTo(this.imgNav);
			if(this.options.autoPlay){ this.imgPlay.addClass('pause'); }else{ this.imgPlay.addClass('play'); }
			this.imgPrev 	= $("<a class='previous'></a>").insertAfter(this.imgPlay);
			this.imgNext 	= $("<a class='next'></a>").insertAfter(this.imgPrev);
			this.caption 	= $("<div class='caption'></div>").insertAfter(this.imgNav);
			if(!this.options.showCaption){ this.caption.hide(); }
			this.aniDiv		= $("<div class='animation'></div>").insertAfter(this.caption);
			this.textNav 	= $("<div class='pika-textnav'></div>").insertAfter(this.aniDiv);
			this.textPrev 	= $("<a class='previous'>"+this.options.text.previous+"</a>").appendTo(this.textNav);
			this.textNext	= $("<a class='next'>"+this.options.text.next+"</a>").appendTo(this.textNav);
			this.list.addClass('pika-thumbs');
        	this.list.children('li').wrapInner("<div class='clip' />");
			this.thumbs = this.list.find('img');
			this.active		= this.thumbs.eq(0);

			//fill in info for first image
			this.finishAnimating({'source':this.active.attr('ref') || this.active.attr('src'),'caption':this.active.parents('li:first').find('span:first').html(), 'clickThrough':this.active.parent().attr('href') || ""});
		
			//process all the thumbnails
			this.thumbs.each(this.createThumb);
        }, //end setup
        /**
         * proccesses thumbnails
         *
         * @method createThumb
         * @return undefined
         */
        createThumb: function() {
        	var self = $(this);
        	$(this).hide();
        	//store all the data with the image
        	$.data(this,'clickThrough',$(this).parent('a').attr('href') || "#");
        	if($(this).parent('a').length > 0){ $(this).unwrap(); }
        	$.data(this,'caption',$(this).next('span').html() || "");
        	$(this).next('span').remove();
        	$.data(this,'source',$(this).attr('ref') || $(this).attr('src'));
			//gets each items index to iterate through them. Thanks to Tushar for the fix.
			$.data(this,'order',$(this).closest('ul').find('li').index($(this).parents('li')));
    		//pass data so it can enter the load scope
    		var data = $.data(this);
    		$('<img />').bind('load',{data:data},function(){
    			//in this scope self refers to the image
				var img = $(this);
				var w = img.width();
				var h = img.height();
				if(w===0){w = img.attr("width");}
				if(h===0){h = img.attr("height");}
				//grab a ratio for image to user defined settings
				var rw = parseInt(self.parents('.clip').css('width').slice(0,-2))/w;
				var rh = parseInt(self.parents('.clip').css('height').slice(0,-2))/h;
				//determine which has the smallest ratio (thus needing
				//to be the side we use to scale so our whole thumb is filled)
				var ratio;
				if(rw<rh){
					//we'll use ratio later to scale and not distort
					ratio = rh;
					var left = ((w*ratio- parseInt(self.parents('.clip').css('width').slice(0,-2)))/2)*-1;
					left = Math.round(left);
					self.css({left:left});
				}else{
					ratio = rw;
					self.css({top:0});
				}
				//use those ratios to calculate scale
				var width = Math.round(w*ratio);
				var height = Math.round(h*ratio);
				self.css("position","relative");
				var imgcss={
					width: width+"px",
					height: height+"px"
				};
				self.css(imgcss);
				self.hover(
					function(){$(this).stop(true,true).fadeTo(250,1);},
					function(){if(!$(this).hasClass("active")){$(this).stop(true,true).fadeTo(250,0.4);}}
				);
				
				if(data.order == 0)
				{
					self.fadeTo(250,1);
					self.addClass('active');
				}else{
					self.fadeTo(250,0.4);
				}
    		}).attr('src',$(this).attr('src'));
        },//end createThumb
        /**
         * proccesses thumbnails
         *
         * @method bindEvents
         * @return undefined
         */
        bindEvents: function() {
        	this.thumbs.bind('click',{self:this},this.imgClick);
        	this.imgNext.bind('click',{self:this},this.nextClick);
        	this.textNext.bind('click',{self:this},this.nextClick);
        	this.imgPrev.bind('click',{self:this},this.prevClick);
        	this.textPrev.bind('click',{self:this},this.prevClick);
        	this.imgPlay.bind('click',{self:this},this.playClick);
        	this.wrap.bind('mouseenter',{self:this},function(e){
        		e.data.self.imgPlay.stop(true,true).fadeIn('fast');
        	});
        	this.wrap.bind('mouseleave',{self:this},function(e){
        		e.data.self.imgPlay.stop(true,true).fadeOut('fast');        	
        	});
        },//end bind event
        /**
         * handles gallery after aclick occurs. and sets active classes
         *
         * @method imgClick
         * @return undefined
         */
	     imgClick: function(e,x) {
	     	var self = e.data.self;
	     	if(self.animating){return;}
			self.caption.fadeOut('slow');
     		if(typeof(x) == 'undefined' || x.how != "auto")
     		{
	     		//arrive here if natural click
	     		if(self.options.autoPlay)
	     		{
	     			self.imgPlay.trigger('click');
	     		}
			}
	     	self.animating = true;
	     	self.active.fadeTo(300,0.4).removeClass('active');
	     	self.active = $(this);
	     	self.active.addClass('active').fadeTo(200,1);
	     	var data = $.data(this);
	 		$('<img />').bind('load', {self:self,data:data}, function()
			{
				//in this scope self referes to the PikaChoose object
				self.aniDiv.css({height:self.image.height(),width:self.image.width()}).fadeIn('fast');
				self.aniDiv.children('div').css({'width':'20%','height':'20%','float':'left'});
		
				//decide our transition
				var n = 0;
				if(self.options.transition[0] == -1)
				{	//random
					n = Math.floor(Math.random()*6);
				}else{
					n = self.options.transition[self.step];
					self.step++;
					if(self.step >= self.options.transition.length){self.step=0;}
				}
				if(self.options.IESafe && $.browser.msie){ n = 0; }
				self.doAnimation(n,data);
				
			}).attr('src',$.data(this).source);//end image preload
	     },//end bindEvents
	     
	     
	     doAnimation: function(n,data)
	     {
	     	
	     		var self = this; //self in this scope refers to PikaChoose object. Needed for callbacks on animations
				var aWidth = self.aniDiv.children('div').eq(0).width();
				var aHeight = self.aniDiv.children('div').eq(0).height();
				self.aniDiv.children().each(function()
				{
					//position myself absolutely
					var div = $(this);
					var xOffset = Math.floor(div.parent().width()/5)*div.attr('col');
					var yOffset = Math.floor(div.parent().height()/5)*div.attr('row');
					div.css({
						'background':'url('+data.source+') -'+xOffset+'px -'+yOffset+'px',
						'width':'0px',
						'height':'0px',
						'position':'absolute',
						'top':yOffset+'px',
						'left':xOffset+'px',
						'float':'none'
					});
				});//end ani_divs.children.each

	     		switch(n)
				{
					case 0:
						//full frame fade
						self.aniDiv.height(self.image.height()).hide().css({'background':'url('+data.source+') top left no-repeat'});
						self.aniDiv.children('div').hide();
						self.aniDiv.fadeIn('slow',function(){
							self.finishAnimating(data);
							self.aniDiv.css({'background':'transparent'});
						});
	
						break;
					case 1:
						self.aniDiv.children().hide().each(function(index)
						{  
							//animate out as blocks 
							var delay = index*30;
							$(this).css({opacity: 0.1}).delay(delay).animate({opacity: 1,"width":aWidth,"height":aHeight},200,'linear',function()
							{
								if($(".animation div").index(this) == 24)
								{
									self.finishAnimating(data);
								}
							});
						});
						break;
					case 2:
						self.aniDiv.children().hide().each(function(index)
						{
							var delay = $(this).attr('row')*30;
							$(this).css({opacity:0.1,"width":aWidth}).delay(delay).animate({opacity:1,"height":aHeight},500,'linear',function()
							{
								if($(".animation div").index(this) == 24)
								{
									self.finishAnimating(data);
								}
							});
						});
						break;						
					case 3:
						self.aniDiv.children().hide().each(function(index)
						{
							var delay = $(this).attr('col')*10;
							aHeight = self.gapper($(this), aHeight);
							$(this).css({opacity:0.1,"height":aHeight}).delay(delay).animate({opacity:1,"width":aWidth},800,'linear',function()
							{
								if($(".animation div").index(this) == 24)
								{
									self.finishAnimating(data);
								}
							});
						});
						break;
					case 4:
						self.aniDiv.children().show().each(function(index)
						{
							var delay = index*Math.floor(Math.random()*5)*10;
							aHeight = self.gapper($(this), aHeight);
							
							if($(".animation div").index(this) == 24)
							{
								delay = 800;
							}
							$(this).css({"height":aHeight,"width":aWidth,"opacity":.01}).delay(delay).animate({"opacity":1},800,function()
							{
								if($(".animation div").index(this) == 24)
								{
									self.finishAnimating(data);
								}
							});
						});
						break;
					case 5:
						//full frame slide
						self.aniDiv.height(self.image.height()).hide().css({'background':'url('+data.source+') top left no-repeat'});
						self.aniDiv.children('div').hide();
						self.aniDiv.css({width:0}).animate({width:self.image.width()},'slow',function(){
							self.finishAnimating(data);
							self.aniDiv.css({'background':'transparent'});
						});
	
						break;
					case 6:
						//fade out then in
						self.aniDiv.hide();
						self.image.fadeOut('slow',function(){
							self.image.attr('src',data.source).fadeIn('slow',function()
							{
								self.finishAnimating(data);
							});
						});
	
						break;
				}

	     },//end doAnimation
	     finishAnimating: function(data)
	     {
     		this.animating = false;
     		this.image.attr('src',data.source);
     		this.aniDiv.hide();
     		this.anchor.attr('href',data.clickThrough);
     		if(this.options.showCaption)
     		{
     			this.caption.html(data.caption).fadeIn('slow');
     		}
     		if(this.options.autoPlay == true)
     		{
     			var self = this;
     			this.image.delay(this.options.speed).fadeIn(0,function(){ if(self.options.autoPlay){ self.nextClick(); } });
     		}
	     },//end finishedAnimating
		 gapper: function(ele, aHeight)
 		 {
			if(ele.attr('row') == 9 && ele.attr('col') == 0)
			{
				//last row, check the gap and fix it!
				var gap = ani_divs.height()-(aHeight*9);
				return gap;
			}
			return aHeight;
		 },
		 nextClick : function(e)
		 {
		 	var how = "natural";
		 	try{
				var self = e.data.self;
			}catch(err)
			{
				var self = this;
				how = "auto";
			}
			var next = self.active.parents('li:first').next().find('img');
			if(next.length == 0){next = self.list.find('img').eq(0);};
		 	next.trigger('click',{how:how});
		 },
		 prevClick : function(e)
		 {
			var self = e.data.self;
			var prev = self.active.parents('li:first').prev().find('img');
			if(prev.length == 0){prev = self.list.find('img:last');};
		 	prev.trigger('click');
		 },
		 playClick: function(e)
		 {
		 	var self = e.data.self;
		 	self.options.autoPlay = !self.options.autoPlay;
			self.imgPlay.toggleClass('play').toggleClass('pause');
			if(self.options.autoPlay){ self.nextClick(); }
		 }
	}); //end extend

})(jQuery);