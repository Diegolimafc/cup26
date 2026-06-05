const STORAGE_KEY = "dicopa2026_predictions";

function getPredictions() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{}'
    );
}

function getPrediction(matchId) {
    const predictions = getPredictions();

    return predictions[String(matchId)] || {
        home: '',
        away: ''
    };
}

function getPrediction(matchId) {
    const predictions = getPredictions();

    return predictions[String(matchId)] || {
        home: '',
        away: ''
    };
}

function savePrediction(matchId, home, away) {
    const predictions = getPredictions();

    predictions[String(matchId)] = {
        home: home === '' ? '' : String(home),
        away: away === '' ? '' : String(away)
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(predictions)
    );

    if (typeof calculateStandings === 'function') {
        calculateStandings();
    }

    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }

    if (typeof renderStats === 'function') {
    renderStats();
    }
}

function exportSimulation(){

const data = {

predictions:
getPredictions(),

exportedAt:
new Date().toISOString()

};

const blob =
new Blob(
[
JSON.stringify(
data,
null,
2
)
],
{
type:
"application/json"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement(
"a"
);

a.href = url;

a.download =
"dicopa2026.json";

a.click();

URL.revokeObjectURL(
url
);

showToast(
"Simulação exportada"
);

}

function importSimulation(
event
){

const file =
event.target.files[0];

if(!file) return;

const reader =
new FileReader();

reader.onload =
e=>{

try{

const imported =
JSON.parse(
e.target.result
);

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(
imported.predictions
)
);

location.reload();

}
catch{

showToast(
"Arquivo inválido"
);

}

};

reader.readAsText(
file
);

} 