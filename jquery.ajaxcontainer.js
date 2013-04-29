(function( $ ){
	var each = function(callback) {
		return function() {
			var _args = arguments;
			return this.each(function(){
				callback.apply( this, _args);
			});
		}
	}

	var addToQuery = function(url, params) {
		return url + (url.indexOf('?') > 0? '&': '?') + params;
	}

	var methods = {
		init : each(function( options ) {
			var $this = $(this),
				data = $this.data('ajaxcontainer');

			var conf = $.extend({
				accumulate: false
			}, options);
				  
			// If the plugin hasn't been initialized yet
			if ( ! data ) {
				$this.data('ajaxcontainer', {
					conf: conf,
					url: $this.attr('data-init'),
					page: $this.attr('data-page'),
					pageSize: $this.attr('data-page-size'),
					loadType: $this.attr('data-load'),
					type: "GET",
					query: null
				});
			}
			data = $this.data('ajaxcontainer');
			if(data.loadType == 'scroll') {
				$(window).scroll(function() {
					var data = $this.data('ajaxcontainer');
					if(!data.loading)
						$this.ajaxcontainer('checkloadcondition');
				});
			}
			$this.ajaxcontainer('load');
		}),

		destroy : each(function( ) {
			var $this = $(this),
				data = $this.data('ajaxcontainer');

			// Namespacing FTW
			//$(window).unbind('.ajaxcontainer');
			$this.unbind('.ajaxcontainer');
			$this.removeData('ajaxcontainer');
		}),

		load: function(params) {
			var $this = $(this); 
			var data = $this.data('ajaxcontainer');
			params = params || {};
			data.loading = true;
			var url = addToQuery(data.url, $.param({ page: data.page, pageSize: data.pageSize}));
			if(data.random)
				url = addToQuery(url, $.param({ rnd: parseInt(Math.random()*100000)}));
			$.ajax({
				"url": url,
				"data": data.query, 
				"type": data.type,
				"success": function(res) {
					data.loading = false;
					var empty;
					if($.trim(res).length == 0) {
						empty = true;
					}
					if(params.accumulate) {
						$(res).appendTo($this).trigger("loaded");
					} else {
						$this.trigger("clear");
						$this.html(res).trigger("loaded");
					}
					if(empty)
						$this.trigger("empty");
					else 
						$this.ajaxcontainer('checkloadcondition');
					//$this.ajaxcontainer('checkloadcondition');
				}
			});
		},

		next: function() {
			var $this = $(this); 
			var data = $this.data('ajaxcontainer');
			data.page++;
			$this.ajaxcontainer('load', {accumulate: data.conf.accumulate});
		},

		set: function(params) {
			var $this = $(this); 
			var data = $this.data('ajaxcontainer');
			params = params || {};
			data.type = params.type || "GET";
			data.query = params.query || null;
			data.random = params.random === true;
			data.page = 1;
			$this.ajaxcontainer('load');
		},

		reset: function() {
			var $this = $(this); 
			$this.ajaxcontainer('set');
		},

		checkloadcondition: function() {
			var $this = $(this); 
			var data = $this.data('ajaxcontainer');

			if(data.loadType == 'scroll') {
				if(data.conf.loadCondition()) {
					$this.ajaxcontainer('next');
				}
			}
		}
	};

	$.fn.ajaxcontainer = function( method ) {
    
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.ajaxcontainer' );
		}    
	};
})( jQuery );
