// -*- coding: utf-8 -*-

"use strict";

var path = require('path');
var express = require('express');
var swig = require('swig');
var request = require('request');
var neat = require('node-neat');
var convertDistance = require('./distanceConverter');
var local = require('./local');
var redirect = require('express-redirect');

var app = new express();
redirect(app);

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(err) {
    console.log("Express is runnning on port: " + app.get('port'));
});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);
swig.setDefaults({ cache: false });

var includePaths = neat.with([
    'node_modules/pagerjs',
    'assets/css',
    'assets/js'
]);

//app.use(rewrite(/\\?hash=(.+)&/, '#!$1/'));
app.redirect('/hash/:params', '/#!/:params', undefined, undefined, true);

app.use(require('connect-assets')({
    paths: includePaths,
    precompile: ["style.css", "main.js"]
}));

app.use('/img/', express.static(path.join(__dirname, 'assets/img')));

app.get('/', (req, res) => {
    res.render('index.html');
});

app.locals.fb_app_id = local.FACEBOOK_APP_ID;
app.locals.google_maps_api_browser_key = local.GOOGLE_MAPS_API_BROWSER_KEY;

function makeDistanceExpression(distance, distanceUnit) {
    var expression;
    if (distance === distanceUnit.dist) {
        expression = "と同じ";
    }
    else if (distance > distanceUnit.dist) {
        expression = "より長い";
    }
    else {
        expression = "より短い";
    }

    return expression;
}

function makeDistanceDescription(distance, distanceUnit) {
    var expression = makeDistanceExpression(distance, distanceUnit);

    return `「${distanceUnit.start}」と「${distanceUnit.end}」間の距離${expression}くらいです。`;
}

app.get('/convert/fromDistance', function(req, res) {
    var distance = parseInt(req.query.distance);
    var distanceUnit = convertDistance(distance);
    var expression = makeDistanceExpression(distance, distanceUnit);
    var description = makeDistanceDescription(distance, distanceUnit);

    var response = {
        distance: distance,
        start: distanceUnit.start,
        end: distanceUnit.end,
        expression: expression,
        description: description,
        description_full: `${distance}mは、${expression}`
    };

    res.json(response);
});

app.get('/convert/fromAddress', function(req, res) {
    var origin = req.query.origin;
    var dest = req.query.dest;

    var apiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    request.get({
        url: apiUrl,
        qs: {
            origins: origin,
            destinations: dest,
            language: 'ja-JP',
            key: local.GOOGLE_MAPS_API_KEY
        }
    }, function(err, resp, body) {
        if (err) {
            res.status(500).json({ err: err });
            return;
        }
        if (resp.statusCode != 200) {
            res.status(500).json({ err: body });
            return;
        }

        var apiResp = JSON.parse(body);

        var originGoogle = apiResp.origin_addresses[0];
        var destGoogle = apiResp.destination_addresses[0];

        var element = apiResp.rows[0].elements[0];
        var status = element.status;
        if (status != "OK") {
            res.status(400).json({ err: status });
            return;
        }

        var distance = element.distance.value;
        var distanceUnit = convertDistance(distance);
        var expression = makeDistanceExpression(distance, distanceUnit);
        var description = makeDistanceDescription(distance, distanceUnit);

        var response = {
            origin: origin,
            destination: dest,
            google_origin: originGoogle,
            google_destination: destGoogle,
            distance: distance,
            start: distanceUnit.start,
            end: distanceUnit.end,
            expression: expression,
            description: description,
            description_full: `${origin}（${originGoogle}）から${dest}（${destGoogle}）間は、${description}`
        };

        res.json(response);
    });
});

// Development time livereload settings
(() => {
    if (process.env.NODE_ENV !== 'production') {
        try {
            var livereload = require('livereload');
        }
        catch(ex) {
            console.warn("Livereload couldn't be loaded.");
            console.warn("Reload the brower by yourself. Work hard! 👼");
            livereload = undefined;
        }

        if (livereload) {
            console.log("Livereload is enabled 🌀");
            var server = livereload.createServer({ exts: [ 'scss' ] });
            server.watch([
                path.join(__dirname)
            ]);
        }
    }
})();
