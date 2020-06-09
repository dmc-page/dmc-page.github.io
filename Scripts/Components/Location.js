;(function () {
    ko.components.register("location", {
        viewModel: function (params) {
            var errorLogger = params.errorLogger;
            var geolocation = params.geolocation;
            var locations = params.locations;
            var viewStack = params.ViewStack;

            this.LocationSelected = ko.pureComputed(function () {
                return geolocation.SelectedLocation();
            });

            this.LocationDescription = ko.pureComputed(function () {
                if (geolocation.SelectedLocation()) {
                    return geolocation.SelectedLocation().Name + " (selected)";
                }

                var nearby = locations.Nearby();

                if (nearby && nearby.length > 0) {
                    return "Near " + nearby[0].Location.Name + " (" + Math.round(nearby[0].Distance) + "m)";
                }
                else {
                    var lat = geolocation.Latitude();
                    var lon = geolocation.Longitude()

                    if (lat != null && lon != null) {
                        return lat + "°, " + lon + "°";
                    }
                    else {
                        return "Awaiting GPS...";
                    }
                }
            });

            this.SetLocation = function () {
                return null;
            }
            this.ClearLocation = function () {
                geolocation.Reset();
            }
        },
        template: '\
            <div class="panel" data-bind="text: LocationDescription"></div>\
            <!-- ko ifnot: LocationSelected -->\
                <button class="panel">Set Location</button>\
            <!-- /ko -->\
            <!-- ko if: LocationSelected -->\
                <button class="panel">Clear Location</button>\
            <!-- /ko -->\
        '
    });
})();