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
var scenesP = document.getElementById('scenes');

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
	panelSet.style.opacity = "0";
	panelSet.innerHTML = e.innerHTML;
	panelSet.style.opacity = "1";
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
			let text = this.responseText;
			//console.log("text: " + text);
			let status = JSON.parse(text);


			document.querySelector("#fps").innerHTML = status.stats.fps.toFixed(2);

			document.querySelector("#skippedF").innerHTML = status.stats.rendermissedframes;

			if(status.status == "ok"){
				document.querySelector("#con").style.background = "green";
			} else{
				document.querySelector("#con").style.background = "red";
			}

			if(status.stats.cpuusage < 3){
				document.querySelector("#cpu").style.background = "green";
				document.querySelector("#cpu").innerHTML = status.stats.cpuusage.toFixed(1);
			} else if(status.stats.cpuusage > 3 && status.stats.cpuusage < 30 ) {
				document.querySelector("#cpu").style.background = "orange";
				document.querySelector("#cpu").innerHTML = status.stats.cpuusage.toFixed(1);
			} else{
				document.querySelector("#cpu").style.background = "red";
				document.querySelector("#cpu").innerHTML = status.stats.cpuusage.toFixed(1);
			}

    } else if (xhttp.readyState == 4 && xhttp.status == 0) {
				document.querySelector("#con").style.background = "red";
				document.querySelector("#cpu").style.background = "red";
				document.querySelector("#cpu").innerHTML = "";
				document.querySelector("#fps").innerHTML = "OFFLINE";
				document.querySelector("#skippedF").innerHTML = "OFFLINE";
			}
  };
  xhttp.open("POST", "http://127.0.0.1:"+port+"/call/GetStats", true);
  xhttp.send();
}

setInterval(streamStatus, 1000);

function getSenes(){
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText);
			let scenesJ = JSON.parse(this.responseText);
			let senesA = scenesJ.scenes;
			let sceneListE = document.querySelector("#sceneBox");
			let sourceListE = document.querySelector("#sourceBox");
			for(i=0; i < senesA.length; i++){
				if(i == 0){
					selected = 'selected';
				} else {
					selected = '';
				}
				if(senesA[i].name == scenesJ.currentscene){
					sceneListE.innerHTML = sceneListE.innerHTML + '<a href="#" class="'+selected+'"onclick="showSources(this, \'S-'+senesA[i].name+'\')">'+senesA[i].name+' (current)<p class="check"><input type="checkbox" name="'+senesA[i].name+'" id="'+senesA[i].name+'"></p></a>';
					sourceListE.innerHTML = sourceListE.innerHTML + '<div id="S-'+senesA[i].name+'" class="sCL '+selected+'" ></div>'
				} else{
					sceneListE.innerHTML = sceneListE.innerHTML + '<a href="#" class="'+selected+'" onclick="showSources(this, \'S-'+senesA[i].name+'\')">'+senesA[i].name+'<p class="check"><input type="checkbox" name="'+senesA[i].name+'" id="'+senesA[i].name+'"></p></a>';
					sourceListE.innerHTML = sourceListE.innerHTML + '<div id="S-'+senesA[i].name+'" class="sCL '+selected+'" ></div>'
				}
				sources = document.getElementById('S-'+senesA[i].name);
				for(a=0; a < senesA[i].sources.length; a++){
					if(senesA[i].sources[a].render == 'TRUE'){
						visible = 'visible';
					} else {
						visible = '';
					}
					if(senesA[i].sources[a].locked == 'TRUE'){
						locked = 'locked';
					} else {
						locked = 'unlocked';
					}
					sources.innerHTML = sources.innerHTML + '<p><span class="icon '+senesA[i].sources[a].type+'"></span>'+senesA[i].sources[a].name+'<span class="icon '+locked+'"></span><span class="icon '+visible+'"></span></p>';
					if(senesA[i].sources[a].type == "group"){
						for(b=0; b < senesA[i].sources[a].groupChildren.length; b++){
							if(senesA[i].sources[a].groupChildren[b].render == 'TRUE'){
								visible = 'visible';
							} else {
								visible = '';
							}
							if(senesA[i].sources[a].groupChildren[b].locked == 'TRUE'){
								locked = 'locked';
							} else {
								locked = 'unlocked';
							}
							sources.innerHTML = sources.innerHTML + '<p class="indent"><span class="icon '+senesA[i].sources[a].groupChildren[b].type+'"></span>'+senesA[i].sources[a].groupChildren[b].name+'<span class="icon '+locked+'"></span><span class="icon '+visible+'"></span></p>';
						}
					}
				}
			}

		} else if (xhttp.readyState == 4 && xhttp.status == 0) {
				sceneListE.innerHTML = "OFFLINE";
			}
	};
	xhttp.open("POST", "http://127.0.0.1:"+port+"/call/GetSceneList", true);
	xhttp.send();
}
function showSources(a, b){
	console.log(a + b);
	document.querySelector("#sceneBox > a.selected").classList.remove('selected');
	a.classList.add('selected');

	document.querySelector(".sCL.selected").classList.remove('selected');
	document.querySelector("#"+b).classList.add('selected');
}
