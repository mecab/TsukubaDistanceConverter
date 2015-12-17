// -*- coding: utf-8 -*-

//= require jquery-2.1.4.js
//= require knockout-3.4.0.js
//= require linq.js

var MainViewModel = (function() {
    function MainViewModel() {
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

    MainViewModel.prototype.submit = function() {
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
    
    return MainViewModel;
})();


(function() {
    var viewModel = new MainViewModel();
    ko.applyBindings(viewModel);
})();
