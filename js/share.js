function shareSimulation(){

const predictions =
getPredictions();

const encoded =
btoa(
JSON.stringify(
predictions
)
);

const url =
location.origin +
location.pathname +
"?sim=" +
encoded;

navigator.clipboard
.writeText(url);

showToast(
"Link copiado"
);

}