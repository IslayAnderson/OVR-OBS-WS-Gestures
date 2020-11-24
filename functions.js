let apiInit = false;
const port = 4445;
let config = {
	"activate": ""
};
var confige = document.getElementsByTagName('config')[0]
var reader = new FileReader();
var panelSet = document.getElementById('panelSet');
var start = document.getElementById('start');
var activate = document.getElementById('activate');

const downloadToFile = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});

  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

	URL.revokeObjectURL(a.href);
};

var xhttp = new XMLHttpRequest();

window.onload = panels(start);
// Called when OVR Tookit's API is injected.
function APIInit() {
	apiInit = true;
}
// example ovr init function
function openWindow() {
	document.getElementById("openedText").style.opacity = 1;
	if (apiInit) {
		SpawnOverlay(JSON.stringify(overlayTransform), "OverlaySpawned");
	}
}

// Example ovr callback
function OverlaySpawned(uid) {
	setTimeout(function() { SetContents("" + uid, 0, JSON.stringify(webContents)) }, 100);
}

function panels(e){
	panelSet.innerHTML = "";
	panelSet.innerHTML = e.innerHTML;
}

function readConfig(e){
		let files = e.files;
		//console.log(reader.readAsText(file));

		if (files.length == 0) return;

		const file = files[0];

		let reader = new FileReader();

		reader.onload = (e) => {
			const file = e.target.result;
			const lines = file.split(/\r\n|\n/);
			confige.innerHTML = lines.join('\n');
		};


		reader.onerror = (e) => alert(e.target.error.name);

		reader.readAsText(file);
}

function loadConfig(e){
	config = JSON.parse(confige.innerText);
}

function finger(e){
	number = e.name.split('c');
	fPos = document.querySelector("finger.f"+number[1]);
	if(fPos.classList[1] == 'o'){
		fPos.classList.remove("o");
		fPos.classList.add("i");
	}else{
		fPos.classList.remove("i");
		fPos.classList.add("o");
	}
}

function activateHotkey(){
	f1 = document.querySelector("#fc1").checked;
	f2 = document.querySelector("#fc2").checked;
	f3 = document.querySelector("#fc3").checked;
	f4 = document.querySelector("#fc4").checked;
	f5 = document.querySelector("#fc5").checked;
	time = document.querySelector("#panelSet > select").value;
	console.log(f1 + ',' + f2 + ',' + f3 + ',' + f4 + ',' + f5 + ',' + time);
	config.activate = f1 + ',' + f2 + ',' + f3 + ',' + f4 + ',' + f5 + ',' + time;
}

function saveState(){
	downloadToFile(JSON.stringify(config), 'config.json', 'text/plain');
}

function streamStatus(){
	xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      status = this.responseText;
    }
  };
  xhttp.open("POST", "http://127.0.0.1:"+port+"/call/GetStats", true);
  xhttp.send();

	document.querySelector("#fps").innerHTML = status.stats.fps;

	document.querySelector("#skippedF").innerHTML = status.stats.render-missed-frames;

	if(status.status == "ok"){
		document.querySelector("#con").background = "green";
	} else{
		document.querySelector("#con").background = "red";
	}

	if(status.stats.cpu-usage < 0.5){
		document.querySelector("#cpu").background = "green";
	} else if(status.stats.cpu-usage > 0.5 && status.stats.cpu-usage < 0.8 ) {
		document.querySelector("#cpu").background = "orange";
	} else{
		document.querySelector("#cpu").background = "red";
	}
}

setInterval(streamStatus, 1000);
