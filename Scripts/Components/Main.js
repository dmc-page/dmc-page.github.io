;(function () {
    var ERROR_DISPLAY_TIME = 3000;
    var NEAR_DISTANCE = 1000;

    function distance(lat1, lon1, lat2, lon2) {
        var r = 6378.137; // Radius of earth, km
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = r * c;
        return d * 1000; // Convert to m
    }

    function ErrorLogger() {
        var self = this;

        this.Errors = ko.observableArray([]);
        this.ErrorTimeouts = [];

        this.Log = function (error, errorDetails) {
            self.Errors.push(error);
            self.ErrorTimeouts.push(setTimeout(function () {
                self.Errors.shift();
                self.ErrorTimeouts.shift();
            }, ERROR_DISPLAY_TIME));

            if (errorDetails) {
                console.error(errorDetails);
            }

            if (self.Errors().length > 3) {
                self.Errors.shift();
                clearTimeout(self.ErrorTimeouts.shift());
            }
        }
    }
    function Geolocation(errorLogger) {
        var self = this;

        this.SelectedLocation = ko.observable(null);

        this.GeolocationLatitude = ko.observable(null);
        this.GeolocationLongitude = ko.observable(null);

        this.Latitude = ko.pureComputed(function () {
            return self.SelectedLocation() ? self.SelectedLocation().Latitude : self.GeolocationLatitude();
        });
        this.Longitude = ko.pureComputed(function () {
            return self.SelectedLocation() ? self.SelectedLocation().Longitude : self.GeolocationLongitude();
        });

        this.Set = function(location) {
            self.SelectedLocation(location);
        }

        this.Reset = function () {
            self.Set(null);
        }

        if (navigator.geolocation) {
            function success(position) {
                self.GeolocationLatitude(position.coords.latitude);
                self.GeolocationLongitude(position.coords.longitude);

                console.log(self.Latitude() + ", " + self.Longitude());
            }
            function error(error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorLogger.Log("User denied the request for geolocation data.", error);
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorLogger.Log("Geolocation data is unavailable.", error);
                        break;
                    case error.TIMEOUT:
                        errorLogger.Log("The geolocation data request timed out.", error);
                        break;
                    default:
                        errorLogger.Log("An unknown error occurred when requesting geolocation data.", error);
                        break;
                }
            }

            navigator.geolocation.watchPosition(success, error);
        }
        else {
            errorLogger.Log("Geolocation is not supported by this browser.");
        }
    }
    function Locations(geolocation) {
        var self = this;

        this.All = ko.observableArray([
            { Latitude: -31.9803089, Longitude: 115.7977648, Name: "Marron Real Estate" },
            { Latitude: -31.9813143, Longitude: 115.7938055, Name: "ACTON Dalkeith" },
            { Latitude: -31.9795406, Longitude: 115.7996742, Name: "HFRC" },
            { Latitude: -31.9794818, Longitude: 115.8029848, Name: "Australia Post" },
            { Latitude: -31.980023, Longitude: 115.7965768, Name: "Chelsea Village" },
            { Latitude: -31.9808781, Longitude: 115.7955552, Name: "Anytime Fitness" },
            { Latitude: -31.979501, Longitude: 115.799665, Name: "kanepi Services Pty. Ltd." },
            { Latitude: -31.9808447, Longitude: 115.7917718, Name: "City Toyota Perth" },
            { Latitude: -31.9792959, Longitude: 115.804351, Name: "Captain Stirling Hotel" },
            { Latitude: -31.9840713, Longitude: 115.7777109, Name: "Airey Real Estate" }
        ]);

        //this.AllByDistance = ko.pureComputed(function () {
        //    var lat = geolocation.Latitude();
        //    var lon = geolocation.Longitude();

        //    if (lat == null || lon == null) {
        //        return self.All();
        //    }
        //    else {
        //        return self.All().map(function (x) {
        //            return {

        //            }
        //        }).sort(function (a, b) {

        //        })
        //    }
        //});


        // TODO: Figure out the best way to do this s.t. there's some stickiness
        // The locations will be moved into their own class, so that'll be where it'll be handled I guess
        this.Nearby = ko.pureComputed(function () {
            var lat = geolocation.Latitude();
            var lon = geolocation.Longitude();

            if (lat == null || lon == null) {
                return null;
            }
            else {
                return self.All().map(function (x) {
                    return {
                        Location: x,
                        Distance: distance(lat, lon, x.Latitude, x.Longitude)
                    };
                }).filter(function (x) {
                    return x.Distance <= NEAR_DISTANCE;
                }).sort(function (a, b) {
                    return a.Distance - b.Distance;
                });
            }
        });
    }

    ko.components.register("main", {
        viewModel: function (params) {
            var self = this;

            this.ErrorLogger = new ErrorLogger();
            this.Geolocation = new Geolocation();
            this.Locations = new Locations(this.Geolocation);
        },
        template: '\
            <!-- ko component: { name: "camera", params: { errorLogger: ErrorLogger } } --><!-- /ko -->\
            <!-- ko component: { name: "overlay", params: { errorLogger: ErrorLogger, geolocation: Geolocation, locations: Locations } } --><!-- /ko -->\
        '
    });
})();