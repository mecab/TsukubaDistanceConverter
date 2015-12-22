// -*- coding: utf-8 -*-
(function(global) {
    var isMapsApiReady = false;

    // http://qiita.com/ryounagaoka/items/a48d3a4c4faf78a99ae5
    function triggerEvent(element, event) {
        var evt;
        if (document.createEvent) {
            // not IE
            evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true ); // event type, bubbling, cancelable
            return element.dispatchEvent(evt);
        } else {
            // IE
            evt = document.createEventObject();
            return element.fireEvent("on" + event, evt);
        }
    }

    global.initAutoComplete = function() {
        console.log('Google Maps API Ready');
        isMapsApiReady = true;
    };

    ko.bindingHandlers.placeAutoComplete = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
            if (!ko.unwrap(valueAccessor())) {
                return;
            }

            var waitMapsApiInterval = setInterval(function() {
                if (!isMapsApiReady)
                    return;

                clearInterval(waitMapsApiInterval);

                var ac = new google.maps.places.SearchBox(element);
                ac.addListener('places_changed', function() {
                    triggerEvent(element, "change");
                });
            }, 500);
        }
    };
})((this || 0).self || global);
