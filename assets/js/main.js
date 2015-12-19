// -*- coding: utf-8 -*-

//= require jquery-2.1.4.js
//= require knockout-3.4.0.js
//= require linq.js

var SectionConverterViewModel = (function() {
    function SectionConverterViewModel() {
        this.origin = ko.observable();
        this.dest = ko.observable();
        this.result = ko.observable();

        this.isResultAvailable = ko.pureComputed(function() {
            return this.result();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.origin() && this.dest();
        }, this);
    }

    SectionConverterViewModel.prototype.submit = function() {
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
    function DistanceConverterViewModel() {
        this.distance = ko.observable();
        this.result = ko.observable();

        this.isResultAvailable = ko.pureComputed(function() {
            return this.result();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.distance();
        }, this);
    }

    DistanceConverterViewModel.prototype.submit = function() {
        console.log('hoge');
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
        return false;
    };

    DistanceConverterViewModel.prototype.templateName = "DistanceConverterTemplate";

    return DistanceConverterViewModel;
})();


var MainViewModel = (function() {
    function MainViewModel() {
        this.sectionConverterViewModel = new SectionConverterViewModel();
        this.distanceConverterViewModel = new DistanceConverterViewModel();

        this.currentConverterViewModel = ko.observable(this.sectionConverterViewModel);

        this.result = ko.pureComputed(function() {
            return this.currentConverterViewModel().result();
        }, this);

        this.isResultAvailable = ko.pureComputed(function() {
            return this.currentConverterViewModel().isResultAvailable();
        }, this);

        this.canSearch = ko.pureComputed(function() {
            return this.currentConverterViewModel().canSearch();
        }, this);
    }

    MainViewModel.prototype.changeConverter = function(viewModelName) {
        console.log(viewModelName);

        this.currentConverterViewModel(this[viewModelName]);
    };

    return MainViewModel;
})();


(function() {
    var viewModel = new MainViewModel();
    ko.applyBindings(viewModel);
})();
