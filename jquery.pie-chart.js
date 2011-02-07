/* jQuery.pieChart() */
(function ($) {
    $.fn.pieChart = function (options) {
        // define default settings
        var settings = {
            'width': null,
            'height': null,
            'padding': 10,
            'shadow': false,
            'display_counts_in_legend': false,
            'colors': ['#8DC3F2', '#926800', '#353E00', '#FE1004', '#FEE325']
        };
        
        return this.each(function () {
            // ensure we've got all the defaults set:
            if (options) {
                $.extend(settings, options);
            }
            
            // quick sanity check:
            if (!settings.data || !settings.data.length) {
                throw "You must specifiy at least one datum to pie-chart";
            }
            
            if (!settings.colors || settings.colors.length === 0) {
                throw "Can't get the next color - no colors specified";
            }
            
            // ensure we're not constantly performing attribute look-ups:
            var colors = settings.colors; 
            
            // define a reference to the current jQuery element:
            var $this = $(this);
            
            // if no width is set, use the elements's width:
            var width = settings.width || $this.width();
            
            // if no height is set, make the canvas square:
            var height = settings.height || width;
            
            // add a canvas element:
            $this.append('<canvas width="' + width + '" height="' + height + '"></canvas>');
            
            // get the new jQuery canvas element:
            var $canvas = $this.children('canvas:last');
            
            // get the pixel width and height in case em, etc. have been used:
            var canvas_width = $canvas.width();
            var canvas_height = $canvas.height();
            
            // find the centre of the canvas:
            var canvas_centre = {
                x: parseInt(canvas_width / 2, 10),
                y: parseInt(canvas_height / 2, 10)
            };
            
            // work-out the radius we can use:
            var radius = Math.min(canvas_centre.x, canvas_centre.y) - settings.padding;
            
            // activate the drawing API:
            var ctx = $canvas.get(0).getContext('2d');
            
            // find the centre of the canvas with a blank circle...
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.strokeStyle = 'black';
            ctx.arc(
                canvas_centre.x, canvas_centre.y, radius, 0, Math.PI * 2, false
                );
            if (settings.shadow) {
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.shadowBlur = 2;
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";			
            }
            ctx.fill();
            // switch off further shadowing:
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.shadowColor = null;
            
            // work out the total count for all data points:
            var total_count = 0;
            $.each(settings.data, function () {
                if (!this.count || this.count <= 0) {
                    throw "You must specify a count for each data point which is >=0";
                }
                total_count += this.count; 
            });
            
            // before looping, set some defaults
            var start_angle = -Math.PI / 2; // ensure we start at 12 o'clock
            var color_index = -1;
            
            function get_next_color() {
                /* closure to pick the next colour in a cycling manner */
                color_index = (
                    color_index >= (colors.length - 1)
                    ) ? 0 : (color_index + 1);
                return colors[color_index];
            }
            
            // add the legend to the container:
            $this.append('<ul class="pie-legend"></ul>');
            var $legend = $this.children('ul.pie-legend');
            
            $.each(settings.data, function () {
                var color = this.color || get_next_color();
                var angle = Math.PI * 2  * (this.count / total_count);
                var end_angle = start_angle + angle;
                ctx.beginPath();
                ctx.moveTo(canvas_centre.x, canvas_centre.y);
                ctx.arc(
                    canvas_centre.x, canvas_centre.y, radius, start_angle,
                    end_angle, false
                    );
                ctx.lineTo(canvas_centre.x, canvas_centre.y);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
            
                start_angle = end_angle;
                                            	
                // add this value's label to the legend:
                var li = '<li><span class="pie-legend-color" style="background: ' + color + ';">&nbsp;</span> ' + this.label;
                if (settings.display_counts_in_legend) {
                    li += ' <span class="pie-legend-count">(' + this.count + ')</span>';
                }
                li += '</li>';
                $legend.append(li);
			});        
	    });
    };
})(jQuery);