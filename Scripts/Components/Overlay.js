;(function () {
    function _viewStackGetView(type, items) {
        var allowed = [];
        switch (type) {
            case "full":
                break;
            case "left":
                allowed = ["right", "topright", "bottomright"];
                break;
            case "right":
                allowed = ["left", "topleft", "bottomleft"];
                break;
            case "topleft":
                allowed = ["right", "topright", "bottomright", "bottomleft"];
                break;
            case "bottomleft":
                allowed = ["right", "topright", "bottomright", "topleft"];
                break;
            case "topright":
                allowed = ["left", "topleft", "bottomleft", "bottomright"];
                break;
            case "bottomright":
                allowed = ["left", "topleft", "bottomleft", "topright"];
                break;
        }

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.type === type) {
                return item;
            }
            else if (allowed.indexOf(item.type) < 0) {
                return null;
            }
        }

        return null;
    }

    function ViewStack() {
        var self = this;

        this.Stack = ko.observableArray([]);

        this.Push = function (component, params, type, isBaseView) {
            // type: "Full", "Left", "Right", "TopLeft", "TopRight", "BottomLeft", "BottomRight"
            self.Stack.unshift({
                component: component,
                params: params,
                type: type.toLowerCase(),
                isBaseView: !!isBaseView
            });
        }
        this.Pop = function (component) {
            if (!item) {
                self.Stack.shift();
            }
            else {
                self.Stack.removeAll(function (x) {
                    return !x.isBaseView && x.component === component;
                });
            }
        }

        this.Full = ko.pureComputed(function () {
            return _viewStackGetView("full", self.Stack());
        });
        this.Left = ko.pureComputed(function () {
            return _viewStackGetView("left", self.Stack());
        });
        this.Right = ko.pureComputed(function () {
            return _viewStackGetView("right", self.Stack());
        });
        this.TopLeft = ko.pureComputed(function () {
            return _viewStackGetView("topleft", self.Stack());
        });
        this.BottomLeft = ko.pureComputed(function () {
            return _viewStackGetView("bottomleft", self.Stack());
        });
        this.TopRight = ko.pureComputed(function () {
            return _viewStackGetView("topright", self.Stack());
        });
        this.BottomRight = ko.pureComputed(function () {
            return _viewStackGetView("bottomright", self.Stack());
        });
    }

    ko.components.register("view-stack", {
        viewModel: function (params) {
            this.ViewStack = params.viewStack;
        },
        template: '\
            <!-- ko with: ViewStack -->\
                <!-- ko with: Full -->\
                    <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                <!-- /ko -->\
                <!-- ko ifnot: Full -->\
                    <div class="panel-container left">\
                        <!-- ko with: Left -->\
                            <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                        <!-- /ko -->\
                        <!-- ko ifnot: Left -->\
                            <div class="sub-panel-container top">\
                                <!-- ko with: TopLeft -->\
                                    <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                                <!-- /ko -->\
                            </div>\
                            <div class="sub-panel-container bottom">\
                                <!-- ko with: BottomLeft -->\
                                    <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                                <!-- /ko -->\
                            </div>\
                        <!-- /ko -->\
                    </div>\
                    <div class="panel-container right">\
                        <!-- ko with: Right -->\
                            <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                        <!-- /ko -->\
                        <!-- ko ifnot: Right -->\
                            <div class="sub-panel-container top">\
                                <!-- ko with: TopRight -->\
                                    <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                                <!-- /ko -->\
                            </div>\
                            <div class="sub-panel-container bottom">\
                                <!-- ko with: BottomRight -->\
                                    <!-- ko component: { name: component, params: params } --><!-- /ko -->\
                                <!-- /ko -->\
                            </div>\
                        <!-- /ko -->\
                    </div>\
                <!-- /ko -->\
            <!-- /ko -->\
        '
    });

    ko.components.register("error-logger-view", {
        viewModel: function (params) {
            this.ErrorLogger = params.errorLogger;
        },
        template: '\
            <!-- ko with: ErrorLogger -->\
                <!-- ko if: Errors().length > 0 -->\
                    <div class="panel error-view" data-bind="foreach: Errors">\
                        <div data-bind="text: $data"></div>\
                    </div>\
                <!-- /ko -->\
            <!-- /ko -->\
        '
    })

    ko.components.register("test", {
        viewModel: function (params) {
            this.Buttons = params.buttons;
        },
        template: '\
            <!-- ko foreach: Buttons -->\
                <button class="panel" data-bind="text: $data"></button>\
            <!-- /ko -->\
        '
    })

    ko.components.register("overlay", {
        viewModel: function (params) {
            this.ViewStack = new ViewStack();

            var errorLogger = params.errorLogger;
            var geolocation = params.geolocation;
            var locations = params.locations;
            var viewStack = this.ViewStack;

            this.ViewStack.Push("location", { errorLogger: errorLogger, geolocation: geolocation, locations: locations, viewStack: viewStack }, "topleft", true);
            this.ViewStack.Push("test", { buttons: ["Show Nearby", "Find"] }, "topright", true);
            this.ViewStack.Push("test", { buttons: ["Settings"] }, "bottomleft", true);
            this.ViewStack.Push("error-logger-view", { errorLogger: errorLogger }, "bottomright", true);
        },
        template: '\
            <div class="overlay-container">\
                <div class="overlay">\
                    <!-- ko component: { name: "view-stack", params: { viewStack: ViewStack } } --><!-- /ko -->\
                </div>\
            </div>\
        '
    });
})();