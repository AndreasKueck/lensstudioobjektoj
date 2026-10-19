//@component
/*
    Trovu objektojn - Ekzemploj.js

    Version für den Places-API-basierten Tracker:
    - zeigt drei 3D-Marker
    - zeigt nur ZEO 1, ZEO 2, ZEO 3
    - keine echten Objekt-Namen
    - keine Koordinaten
    - Entfernungen kommen bereits ganzzahlig vom Tracker
    - Richtungen werden als Esperanto-Himmelsrichtungen angezeigt
*/

//@input SceneObject infoText
//@input Component.Camera cam

//@input SceneObject object0
//@input SceneObject object1
//@input SceneObject object2

//@input float markerBaseScale = 40.0

var markers = [
    script.object0,
    script.object1,
    script.object2
];

var targets = null;
var isRequesting = false;

var infoTextComponent = null;

// InfoText vor der Kamera platzieren
if (script.infoText && script.cam) {
    script.infoText.setParent(script.cam.getSceneObject());
    script.infoText.getTransform().setLocalPosition(new vec3(0, 0, -30));
    infoTextComponent = script.infoText.getComponent("Component.Text");
}

setInfoText("Serchante Zamenhof/Esperanto-objektojn ...");
setMarkersEnabled(false);

requestTargets();

// Marker pro Frame in die berechnete Richtung setzen
script.createEvent("UpdateEvent").bind(function () {
    if (!targets || !script.cam) {
        setMarkersEnabled(false);
        return;
    }

    var camTransform = script.cam.getTransform();
    var userPosition = camTransform.getWorldPosition();

    var baseScale = script.markerBaseScale || 40.0;
    var markerScale = baseScale * (script.cam.far / 1000.0);

    var placeDistance = script.cam.far - markerScale * 2.0;
    if (placeDistance < 10) {
        placeDistance = script.cam.far * 0.8;
    }

    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];

        if (!marker || !targets[i] || !targets[i].direction) {
            if (marker) {
                marker.enabled = false;
            }
            continue;
        }

        var target = targets[i];

        var t = marker.getTransform();
        var dir = target.direction.normalize();

        var markerPosition = userPosition.add(dir.uniformScale(placeDistance));

        marker.enabled = true;
        t.setWorldPosition(markerPosition);
        t.setWorldScale(vec3.one().uniformScale(markerScale));

        // Marker zur Kamera ausrichten.
        // Falls dein 3D-Modell dadurch falsch orientiert ist,
        // diese beiden Zeilen entfernen oder das Modell im Editor drehen.
        var lookDir = userPosition.sub(markerPosition).normalize();
        t.setWorldRotation(quat.lookAt(lookDir, vec3.up()));
    }
});

function requestTargets() {
    if (isRequesting) {
        return;
    }

    if (!global.TrovuObjektojnTracker) {
        setInfoText("TrovuObjektojnTracker ne trovita.");
        print("[Trovu objektojn] TrovuObjektojnTracker ne trovita.");
        return;
    }

    isRequesting = true;
    targets = null;

    setMarkersEnabled(false);
    setInfoText("Serchante Zamenhof/Esperanto-objektojn ...");

    global.TrovuObjektojnTracker.getNearestObjects(
        function (info) {
            isRequesting = false;
            targets = info.objects;

            if (!targets || targets.length === 0) {
                setMarkersEnabled(false);
                setInfoText("Neniu ZEO trovita.");
                return;
            }

            printTargetsToConsole();
            updateInfoTextWithTargets();
        },
        function (err) {
            isRequesting = false;
            targets = null;

            setMarkersEnabled(false);
            setInfoText("Eraro: " + err);
            print("[Trovu objektojn] " + err);
        }
    );
}

function updateInfoTextWithTargets() {
    if (!targets || targets.length === 0) {
        setInfoText("Neniu ZEO trovita.");
        return;
    }

    var lines = [];

    lines.push("Trovitaj Zamenhof/Esperanto-objektoj:");

    for (var i = 0; i < targets.length; i++) {
        var t = targets[i];

        lines.push(
            "ZEO " + (i + 1) + ": " +
            t.distanceText + " · " +
            getDirectionText(t)
        );
    }

    setInfoText(lines.join("\n") + "\n" + "Ili aperas en la ghustaj direktoj, se" + "\n" + "komence la fotilo estis direktita norden.");
}

function printTargetsToConsole() {
    if (!targets) {
        return;
    }

    for (var i = 0; i < targets.length; i++) {
        print(
            "[Trovu objektojn] " +
            "ZEO " + (i + 1) + " | " +
            targets[i].distanceText + " | " +
            getDirectionText(targets[i])
        );
    }
}

function getDirectionText(target) {
    if (!target) {
        return "";
    }

    if (target.bearingText) {
        return target.bearingText;
    }

    return formatAzimuthOnly(target.azimuth);
}

// Fallback, falls bearingText einmal nicht gesetzt ist.
function formatAzimuthOnly(azimuth) {
    if (azimuth === undefined || azimuth === null || isNaN(azimuth)) {
        return "";
    }

    return compassPointEsperanto(azimuth);
}

function compassPointEsperanto(deg) {
    var dirs = [
        "norde",
        "nord-oriente",
        "oriente",
        "sud-oriente",
        "sude",
        "sud-okcidente",
        "okcidente",
        "nord-okcidente"
    ];

    var index = Math.round(normalizeDeg(deg) / 45) % 8;
    return dirs[index];
}

function normalizeDeg(deg) {
    deg = deg % 360;
    if (deg < 0) {
        deg += 360;
    }
    return deg;
}

function setMarkersEnabled(enabled) {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].enabled = enabled;
        }
    }
}

function setInfoText(text) {
    if (infoTextComponent) {
        infoTextComponent.text = text;
    } else {
        print("[Trovu objektojn] " + text);
    }
}