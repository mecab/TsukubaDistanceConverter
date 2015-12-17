// -*- coding: utf-8 -*-

"use strict";

var path = require('path');
var express = require('express');
var swig = require('swig');
var request = require('request');
var neat = require('node-neat');
var convertDistance = require('./distanceConverter');
var local = require('./local');
var ConnectMincer = require('connect-mincer');

var app = new express();
app.listen(3000, function(err) {
    console.log("Express is runnning on port 3000");
});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);
swig.setDefaults({ cache: false });

var includePaths = neat.with([
    'assets/css',
    'assets/js'
]);
var connectMincer = new ConnectMincer({
    root: __dirname,
    production: process.env.NODE_ENV === 'production',
    mountPoint: '/assets',
    manifestFile: path.join(__dirname, '/builtAssets/manifest.json'),
    paths: includePaths
});

app.use(connectMincer.assets());

if (process.env.NODE_ENV == 'production')
    app.use('/assets', express.static('builtAssets'));
else
    app.use('/assets', connectMincer.createServer());
    

app.get('/', (req, res) => {
    res.render('index.html');
});

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
    return `${distanceUnit.start} と ${distanceUnit.end} 間の距離${expression}くらいです。`;
}

app.get('/convert/fromDistance', function(req, res) {
    var distance = parseInt(req.query.distance);
    var distanceUnit = convertDistance(distance);
    var expression = makeDistanceExpression(distance, distanceUnit);    

    var response = {
        start: distanceUnit.start,
        end: distanceUnit.end,
        text: `${distance}mは、${expression}`
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

        var response = {
            google_origin: originGoogle,
            google_destination: destGoogle,
            start: distanceUnit.start,
            end: distanceUnit.end,
            text: `${origin}（${originGoogle}）から${dest}（${destGoogle}）間は、${expression}`
        };

        res.json(response);
    });
});
