(function($){

	window.Ffgrid = {};

	var Ffgrid = window.Ffgrid;
	
	Ffgrid.config = {
		grid_class_prefix : 'grid-',
		gutter_size: 2,
		columns: 12,
		min_width: 992
	};

	Ffgrid.version = '0.0.1';
	
	// to hold grid element collection
	Ffgrid.grid_elements = {};
	
	// will hold the calculated gutter widths
	Ffgrid.grid_gutter = '';
	// an array holding grid unit widths
	Ffgrid.grid_widths = [];
	
	Ffgrid.spanUnits = function Ffgrid_span(element)
	{
		var span = 1;
		// get the element's classes and iterate through them
		var classes = $(element).attr('class').split(' ');
		for(var c in classes)
		{
			// test if the class name contains our grid class prefix
			if(classes[c].indexOf(Ffgrid.config.grid_class_prefix) > -1)
			{
				// get the grid units to span by removing the grid class prefix
				span = classes[c].substring(Ffgrid.config.grid_class_prefix.length) * 1;
				// make sure it's numeric
				if(isNaN(span))
				{
					return false;
				}
			}
		}
		return span;
	};
	
	Ffgrid.rowWidth = function Ffgrid_rowWidth(element)
	{
		var w=Ffgrid.grid_widths[Ffgrid.spanUnits(element)];
		var prev;
		for(prev=$(element).prev();!$(prev).hasClass('first');prev=$(prev).prev())
		{
			// add the previous element's width + gutter width
			w+=Ffgrid.grid_widths[Ffgrid.spanUnits(prev)]+Ffgrid.grid_gutter;
		}
		// add width of .first element in this row and another gutter
		w+=Ffgrid.grid_widths[Ffgrid.spanUnits(prev)]+Ffgrid.grid_gutter;
		return w;
	}
	
	Ffgrid.gridWidth = function Ffgrid_gridWidth(element)
	{
		// first get the number of units this element spans
		var span = $(element).data('ffgrid_span');
		// then get its width
		var width = Ffgrid.grid_widths[span];
		
		if($(element).hasClass('last'))
		{
			// see if the total grid units width is more than available width
			// first get the parent (container) element's width
			var aw = $(element).parent().width();
			// then calculate the total
			var tw = Ffgrid.rowWidth(element);
			// if so then subtract the difference from the last grid unit?
			if(tw > aw)
			{
				width -= tw - aw;
			}
		}
		return width+'px';
	};
	
	Ffgrid.reset = function Ffgrid_reset(){
		// get the elements with a class like our grid class prefix
		// and iterate over each one
		Ffgrid.grid_elements.each(function(){
			// make sure it's a valid grid unit
			if(!$(this).data('ffgrid_span'))
			{
				return;
			}
			
			// see if we need to apply gutter
			if(!$(this).hasClass('last'))
			{
				$(this).css('margin-right',Ffgrid.grid_gutter+'px');
			}
			
			// apply the width
			$(this).css('width', Ffgrid.gridWidth(this));
		});
	};
	
	Ffgrid.clearStyles = function Ffgrid_clear()
	{
		$('[class*='+Ffgrid.config.grid_class_prefix+']').css({
			'margin-right':'',
			width:''
		});
	};
	
	Ffgrid.resize = function Ffgrid_resize()
	{
		// get the grid container
		var container = $('.container');

		// first get the container width
		var w = $(container).width();
		
		// see if the width is less than the config min
		if(Ffgrid.config.min_width && Ffgrid.config.min_width > 0 && w < Ffgrid.config.min_width)
		{
			// if so just clear any previously set styling and return
			Ffgrid.clearStyles();
			return;
		}
		
		// calculate gutter width
		var gw = Ffgrid.config.gutter_size / 100 * w;
		// calculate total gutters width
		var total_gw = (Ffgrid.config.columns - 1) * gw;
		// the available width for columns
		var aw = w - total_gw;
		// see if the available width is evenly divisible by num cols
		if(aw % Ffgrid.config.columns == 0)
		{
			Ffgrid.clearStyles();
			return;
		}
		
		// set gutter width
		gw = Math.round(gw);
		Ffgrid.grid_gutter = gw;
		// set available width
		Ffgrid.available_grid_width = w - ((Ffgrid.config.columns - 1) * gw);
		
		// calculate grid unit width
		var uw = Math.round(aw / Ffgrid.config.columns);
		// total length of grid units
		Ffgrid.total_grid_width = uw * Ffgrid.config.columns;
		// reset array of grid widths
		Ffgrid.grid_widths = [];
		// iterate through the grid span possibilities
		for(var span=1;span<=Ffgrid.config.columns;span++)
		{
			// and set its width
			Ffgrid.grid_widths[span] = (uw * span) + ((span - 1) * gw);
		}

		// reset the grid
		Ffgrid.reset();
	};
	
	Ffgrid.init = function Ffgrid_init()
	{
		// get the elements with a class like our grid class prefix
		Ffgrid.grid_elements = $('[class*='+Ffgrid.config.grid_class_prefix+']');
		// and iterate over each one
		Ffgrid.grid_elements.each(function(){
			// extract the number of grid units to span from its class
			// and set it in elements data for easy retrieval later on
			$(this).data('ffgrid_span',Ffgrid.spanUnits(this));
		});
		Ffgrid.resize();
	};
	
})(jQuery);

// due to a safari 4 final bug, this initialization must be done on window.load event
// definitely a must fix either on elastic or jquery
jQuery(window).bind('load', function(){
	// check for webkit
	if (/khtml|webkit/i.test(navigator.userAgent))
	{
		// initialize ffgrid
		Ffgrid.init();
		// bind the window resize event to ffgrid
		jQuery(window).bind('resize',function Ffgrid_resizeHandler(){
				Ffgrid.resize();
		});
	}
});
