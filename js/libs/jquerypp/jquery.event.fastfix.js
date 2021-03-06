/** 
 * jquery.event.fastfix.js
 * 
 */
(function () {
	// http://bitovi.com/blog/2012/04/faster-jquery-event-fix.html
	// https://gist.github.com/2377196

	// IE 8 has Object.defineProperty but it only defines DOM Nodes. According to
	// http://kangax.github.com/es5-compat-table/#define-property-ie-note
	// All browser that have Object.defineProperties also support Object.defineProperty properly
	if(Object.defineProperties) {
		var set = function (obj, prop, val) {
				if(val !== undefined) {
					Object.defineProperty(obj, prop, {
						value : val
					});
				}
				return val;
			},
			special = {
				pageX : function (original) {
					var eventDoc = this.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					return original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				},
				pageY : function (original) {
					var eventDoc = this.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					return original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
				},
				relatedTarget : function (original) {
					if(!original) {
						return;
					}
					return original.fromElement === this.target ? original.toElement : original.fromElement;
				},
				metaKey : function (originalEvent) {
					return originalEvent.ctrlKey;
				},
				/* TODO this was in here twice. Probably wrong
				 which : function(original){
				 var button = original.button;
				 return ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				 },
				 */
				which : function (original) {
					return original.charCode != null ? original.charCode : original.keyCode;
				}
			},
			oldEvent = jQuery.Event;

		jQuery.each(jQuery.event.keyHooks.props.concat(jQuery.event.mouseHooks.props).concat(jQuery.event.props), function (i, prop) {
			if (prop !== "target") {
				(function () {
					Object.defineProperty(jQuery.Event.prototype, prop, {
						get : function () {
							// get the original value, undefined when there is no original event
							var originalValue = this.originalEvent && this.originalEvent[prop];
							// overwrite getter lookup
							return this['_' + prop] !== undefined ? this['_' + prop] : set(this, prop,
								// if we have a special function and no value
								special[prop] && originalValue === undefined ?
									// call the special function
									special[prop].call(this, this.originalEvent) :
									// use the original value
									originalValue)
						},
						set : function (newValue) {
							this['_' + prop] = newValue;
						}
					});
				})();
			}
		});

		jQuery.event.fix = function (event) {
			if (event[ jQuery.expando ]) {
				return event;
			}
			// Create a jQuery event with at minimum a target and type set
			var originalEvent = event,
				event = jQuery.Event(originalEvent);
			event.target = originalEvent.target;
			// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
			if (!event.target) {
				event.target = originalEvent.srcElement || document;
			}

			// Target should not be a text node (#504, Safari)
			if (event.target.nodeType === 3) {
				event.target = event.target.parentNode;
			}

			return event;
		}
	}
})(jQuery)