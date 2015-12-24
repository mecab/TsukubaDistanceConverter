// -*- coding: utf-8 -*-

//= require jquery-2.1.4.js
//= require knockout-3.4.0.js
//= require pager.js
//= require linq.js
//= require util.js
//= require autoComplete.js

var SectionConverterViewModel = (function() {
    function SectionConverterViewModel(qp) {
        qp = qp || {};
        this.origin = ko.observable(qp.origin);
        this.dest = ko.observable(qp.dest);
        this.result = ko.observable();
        this.isProcessing = ko.observable(false);
        this.error = ko.observable();

        this.permanentUrl = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return Util.getBaseUrl() + pager.page.path({
                path: 'fromSection',
                params: {
                    origin: this.result().origin,
                    dest: this.result().destination
                }
            });
        }, this);

        this.tweetText = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return "筑波大距離計算器で" +
                this.result().origin +
                "から" +
                this.result().destination +
                "への距離を求めました！";
        }, this);

        this.facebookShareUrl = ko.pureComputed(function() {
            return 'https://www.facebook.com/dialog/feed?app_id=' + FACEBOOK_APP_ID +
                '&display=popup' +
                '&link=' + encodeURI(this.permanentUrl().replace('#!/', 'hash/')) +
                '&redirect_uri=' + encodeURI(this.permanentUrl().replace('#!/', 'hash/')) +
                '&caption=' + this.tweetText() +
                '&description=' + this.tweetText();
        }, this);

        this.isResultAvailable = ko.pureComputed(function() {
            return this.result() && !this.error();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.origin() && this.dest() && !this.isProcessing();
        }, this);

        this.submitButtonText = ko.pureComputed(function() {
            return this.isProcessing() ? "換算中" : "換算";
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
        this.isProcessing(true);
        this.result(null);
        this.error(null);
        $.ajax({
            url: "/convert/fromAddress",
            data: {
                origin: this.origin.peek(),
                dest: this.dest.peek()
            },
            dataType: 'json',
            timeout: 5000
        })
            .done(function(e) {
                that.result(e);
            })
            .fail(function(jqxhr, textStatus, error) {
                if (!error && jqxhr.readyState === 0) {
                    console.error("NETWORK");
                    that.error("NETWORK");
                }
                else if (error == "timeout") {
                    console.error("TIMEOUT");
                    that.error("TIMEOUT");
                }
                else if ((jqxhr.responseJSON || {}).err) {
                    console.error(jqxhr.responseJSON.err);
                    that.error(jqxhr.responseJSON.err);
                }
                else {
                    that.error("UNKNOWN");
                }
            })
            .always(function(e) {
                that.isProcessing(false);
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
        this.isProcessing = ko.observable(false);
        this.error = ko.observable();

        this.isResultAvailable = ko.pureComputed(function() {
            return this.result() && !this.error();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.distance() && !this.isProcessing();
        }, this);

        this.permanentUrl = ko.pureComputed(function() {
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

        this.tweetUrl = ko.pureComputed(function() {
            return 'https://twitter.com/intent/tweet?' +
                '&text=' + encodeURIComponent(this.tweetText()) +
                '&url=' + encodeURIComponent(this.permanentUrl());
        }, this);

        this.tweetText = ko.pureComputed(function() {
            if (!this.isResultAvailable()) {
                return "";
            }
            return "筑波大距離計算器で" +
                this.result().distance +
                "メートルを計算しました！";
        }, this);

        this.facebookShareUrl = ko.pureComputed(function() {
            return 'https://www.facebook.com/dialog/feed?app_id=' + FACEBOOK_APP_ID +
                '&display=popup' +
                '&link=' + encodeURI(this.permanentUrl().replace('#!/', 'hash/')) +
                '&redirect_uri=' + encodeURI(this.permanentUrl().replace('#!/', 'hash/')) +
                '&caption=' + this.tweetText() +
                '&description=' + this.tweetText();
        }, this);

        this.submitButtonText = ko.pureComputed(function() {
            return this.isProcessing() ? "換算中" : "換算";
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
        this.isProcessing(true);
        this.result(null);
        this.error(null);
        $.ajax({
            url: "/convert/fromDistance",
            data: {
                distance: this.distance.peek()
            },
            dataType: 'json',
            timeout: 5000
        })
            .done(function(e) {
                that.result(e);
            })
            .fail(function(jqxhr, textStatus, error) {
                if (!error && jqxhr.readyState === 0) {
                    console.error("NETWORK");
                    that.error("NETWORK");
                }
                else if (error == "timeout") {
                    console.error("TIMEOUT");
                    that.error("TIMEOUT");
                }
                else if ((jqxhr.responseJSON || {}).err) {
                    console.error(jqxhr.responseJSON.err);
                    that.error(jqxhr.responseJSON.err);
                }
                else {
                    that.error("UNKNOWN");
                }
            })
            .always(function(e) {
                that.isProcessing(false);
            });
        return true;
    };

    DistanceConverterViewModel.prototype.templateName = "DistanceConverterTemplate";

    return DistanceConverterViewModel;
})();


var MainViewModel = (function() {
    function MainViewModel() {
        var qp = Util.getQueryParameters();
        
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
            setTimeout(function () {
            $('.btn-tweet').html('');
            $('.btn-tweet').html('<a href="https://twitter.com/share" ' +
                                 'class="twitter-share-button"{count}' +
                                 'data-url="' + that.permanentUrl() + '"' +
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

        this.permanentUrl = ko.pureComputed(function() {
            return this.currentConverterViewModel().permanentUrl();
        }, this);

        this.tweetText = ko.pureComputed(function() {
            return this.currentConverterViewModel().tweetText();
        }, this);

        this.tweetUrl = ko.pureComputed(function() {
            return 'https://twitter.com/intent/tweet?' +
                '&text=' + encodeURIComponent(this.tweetText()) +
                '&url=' + encodeURIComponent(this.permanentUrl());
        }, this);

        this.facebookShareUrl = ko.pureComputed(function() {
            return this.currentConverterViewModel().facebookShareUrl();
        }, this);
    }

    MainViewModel.prototype.changeConverter = function(viewModelName) {
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

    if (viewModel.canSearch()) {
        viewModel.currentConverterViewModel().submit();
    }
})();
