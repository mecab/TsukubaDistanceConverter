// -*- coding: utf-8 -*-

//= require jquery-2.1.4.js
//= require knockout-3.4.0.js
//= require pager.js
//= require linq.js
//= require util.js

var SectionConverterViewModel = (function() {
    function SectionConverterViewModel(qp) {
        qp = qp || {};
        this.origin = ko.observable(qp.origin);
        this.dest = ko.observable(qp.dest);
        this.result = ko.observable();

        this.tweetUrl = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return Util.getBaseUrl() + pager.page.path({
                path: 'fromSection',
                params: {
                    origin: this.result().origin,
                    dest: this.result().dest
                }
            });
        }, this);

        this.tweetText = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return "筑波大距離計算機で" +
                this.result().origin +
                "から" +
                this.result().destination +
                "への距離を求めました！";
        }, this);

        this.isResultAvailable = ko.pureComputed(function() {
            return this.result();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.origin() && this.dest();
        }, this);
    }

    SectionConverterViewModel.prototype.submit = function() {
        pager.navigate(
            pager.page.path({
                path: 'fromSection',
                params: {
                    origin: this.origin.peek(),
                    dest: this.dest.peek()
                }
            })
        );

        var that = this;
        $.ajax({
            url: "/convert/fromAddress",
            data: {
                origin: this.origin.peek(),
                dest: this.dest.peek()
            },
            dataType: 'json'
        }).then(function(e) {
            that.result(e);
        });
        return false;
    };

    SectionConverterViewModel.prototype.templateName = "SectionConverterTemplate";

    return SectionConverterViewModel;
})();

var DistanceConverterViewModel = (function() {
    function DistanceConverterViewModel(qp) {
        qp = qp || {};
        this.distance = ko.observable(qp.distance);
        this.result = ko.observable();

        this.isResultAvailable = ko.pureComputed(function() {
            return this.result();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.distance();
        }, this);

        this.tweetUrl = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return Util.getBaseUrl() + pager.page.path({
                path: 'fromDistance',
                params: {
                    distance: this.result().distance
                }
            });
        }, this);

        this.tweetText = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return "筑波大距離計算機で" +
                this.result().distance +
                "メートルを計算しました！";
        }, this);
    }

    DistanceConverterViewModel.prototype.submit = function() {
        pager.navigate(
            pager.page.path({
                path: 'fromDistance',
                params: { distance: this.distance.peek() }
            })
        );

        var that = this;
        $.ajax({
            url: "/convert/fromDistance",
            data: {
                distance: this.distance.peek()
            },
            dataType: 'json'
        }).then(function(e) {
            that.result(e);
        });
        return true;
    };

    DistanceConverterViewModel.prototype.templateName = "DistanceConverterTemplate";

    return DistanceConverterViewModel;
})();


var MainViewModel = (function() {
    function MainViewModel() {
        var qp = Util.getQueryParameters();
        console.log(qp);
        
        this.sectionConverterViewModel = new SectionConverterViewModel(qp);
        this.distanceConverterViewModel = new DistanceConverterViewModel(qp);

        this.currentConverterViewModel = ko.observable(
            qp.converter === 'distance' ?
                this.distanceConverterViewModel : this.sectionConverterViewModel
        );

        this.hash = ko.observable(function() { return window.location.hash; });

        this.result = ko.pureComputed(function() {
            return this.currentConverterViewModel().result();
        }, this);

        this.result.subscribe(function(newValue) {
            var that = this;
            console.log(newValue);
            setTimeout(function () {
            $('.btn-tweet').html('');
            $('.btn-tweet').html('<a href="https://twitter.com/share" ' +
                                 'class="twitter-share-button"{count}' +
                                 'data-url="' + that.tweetUrl() + '"' +
                                 'data-text="' + that.tweetText() + '"' +
                                 'data-size="large"' +
                                 '>Tweet</a>');
                twttr.widgets.load();
            }, 500);
        }, this);

        this.isResultAvailable = ko.pureComputed(function() {
            return this.currentConverterViewModel().isResultAvailable();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.currentConverterViewModel().canSearch();
        }, this);

        this.tweetUrl = ko.pureComputed(function() {
            return this.currentConverterViewModel().tweetUrl();
        }, this);

        this.tweetText = ko.pureComputed(function() {
            return this.currentConverterViewModel().tweetText();
        }, this);

    }

    MainViewModel.prototype.changeConverter = function(viewModelName) {
        console.log(viewModelName);

        this.currentConverterViewModel(this[viewModelName]);
    };

    return MainViewModel;
})();


(function() {
    viewModel = new MainViewModel();
    pager.Href.hash = '#!/';
    pager.extendWithPage(viewModel);
    
    ko.applyBindings(viewModel);
    pager.start();
})();
