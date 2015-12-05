(function(global) {
    "use strict";

    var Enumerable = require('linq');

    var TSUKUBA_DISTANCES = [
        { start: "筑波大学附属病院", end: "追越生活センター/医学", dist: 300 }, 
        { start: "大学会館", end: "中央図書館", dist: 400 },
        { start: "第1エリア", end: "第3エリア（L棟）/第2エリア（D棟）", dist: 500 },
        { start: "大学会館", end: "第3エリア（L棟）/第2エリア（D棟）", dist: 600 },
        { start: "つくばセンター", end: "春日キャンパス", dist: 650 },
        { start: "第3エリア（F棟） / 第2エリア（A棟）", end: "一の矢生活センター", dist: 700 },
        { start: "中央図書館", end: "一の矢生活センター", dist: 800 },
        { start: "平砂生活センター", end: "第1エリア", dist: 1000 },
        { start: "つくばセンター", end: "筑波大学附属病院", dist: 1400 },
        { start: "つくばセンター", end: "追越生活センター / 医学", dist: 1700 },
        { start: "つくばセンター", end: "平砂生活センター", dist: 2100 },
        { start: "つくばセンター", end: "芸専", dist: 2700 },
        { start: "つくばセンター", end: "大学会館", dist: 3000 },
        { start: "つくばセンター", end: "第1エリア", dist: 3100 },
        { start: "つくばセンター", end: "中央図書館", dist: 3400 },
        { start: "つくばセンター", end: "第3エリア（F棟）/第2エリア（A棟）", dist: 3500 },
        { start: "つくばセンター", end: "第3エリア（L棟）/第2エリア（D棟）", dist: 3600 },
        { start: "つくばセンター", end: "一の矢生活センター", dist: 4300 }
    ];

    var maxTsukubaDistanceUnit = Enumerable.from(TSUKUBA_DISTANCES)
        .maxBy('$.dist');

    function convertToTsukubaDistance(distance) {
        function shouldUseShorter() {
            return shorter && (longer.distance - distance) < (shorter.distance - distance);
        }
        
        if (distance >= maxTsukubaDistanceUnit.dist) {
            console.log(distance);
            return maxTsukubaDistanceUnit;
        }

        var shorter = null;
        var longer = null;
        Enumerable.from(TSUKUBA_DISTANCES)
            .orderBy('$.dist')
            .forEach(function(td) {
                shorter = longer;
                longer = td;

                if (td.dist >= distance)
                    return false;

                return true;
            });
        
        if (shouldUseShorter()) {
            return shorter;
        }
        else {
            return longer;
        }
    }

    // Exports
    if ("process" in global) {
        module["exports"] = convertToTsukubaDistance;
    }
    global["DistanceConverter"] = {
        convertToTsukubaDistance: convertToTsukubaDistance
    };

})((this || 0).self || global);
