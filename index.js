/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/*
Description:


Manual:


Version:
29.03.24
20:59

*/

var startTime, path, panorama, startLoc, currentLatLong, tempControlUI, mapClickListener;
let map, guessMarker, targetMarker, targetPath, replyText;

const zeroPosition = { lat: 0, lng: 0 };


async function initPano() {
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const { Geometry } = await google.maps.importLibrary("geometry");

    
  newSpot();
  
  //Create map for guessing
  map = new Map(document.getElementById("map"), {
  	center: zeroPosition,
    zoom: 1,
    mapTypeControlOptions: {
    	mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
    },
    disableDefaultUI: true,
	mapId: "f0133ed91e943e1c",
	draggableCursor: 'default',
  });
  
  
  //Create StreetView panorama
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("pano"),
    {
      position: zeroPosition,
      addressControl: false, //address box (top left corner of panorama)
      linksControl: true, //arrows for navigation
      panControl: true, //compass
      enableCloseButton: false, //button (left arrow in top left corner of panorama) for going back
      disableDefaultUI: false,
    },
  );
    
    
  //Create "New Game" control button in top right corner of panorama
  var newGameControlDiv = document.createElement("div");
  tempControlUI = createControl(newGameControlDiv, "Starts a New Game Session", "New Game", "5px", "25px");
  tempControlUI.addEventListener("click", () => {
  		newSpot();
  });
  panorama.controls[google.maps.ControlPosition.TOP_RIGHT].push(newGameControlDiv);
  
  //
  //Create "Submit" control button in top left corner of map
  var submitControlDiv = document.createElement("div");
  tempControlUI = createControl(submitControlDiv, "Submit", "Submit", "3px", "16px");
  tempControlUI.addEventListener("click", () => {
  		submitGuess();
  });
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitControlDiv);
  
      
  map.setStreetView(panorama);
  
  
  //Create PinElement for guessMarker
  const pinGuessMarker = new PinElement({
  	scale: 0.7,
	background: "#1A3CD5",
	borderColor: "black",
	glyphColor: "black",
  });
    
  //Create marker for guessing
  guessMarker = new AdvancedMarkerElement({
    map: map,
    position: { lat: 0, lng: 0 },
	title: "My guess",
	content: pinGuessMarker.element,
  });
  
  /*
  //legacy marker (old version)
  guessMarker = new google.maps.Marker ({
  	map: map,
	position: {lat: 0, lng: 0},
	title: "My guess",
  });
  */
  
  mapClickListener = google.maps.event.addListener(map, 'click', function(event) {
  	moveMarker(event.latLng);
  });
  
  
}


//window.initPano = initPano;

initPano();

async function newSpot() 
{
	const { Map } = await google.maps.importLibrary("maps");
	
	startTime = new Date().getTime();
    try {
		//Set click listener again for moving guessMarker
		mapClickListener = google.maps.event.addListener(map, 'click', function(event) {
  			moveMarker(event.latLng);
  		});
		
		//center map at {lat: 0, lng: 0} and reset zoom to 1
		map.setCenter(zeroPosition);
		map.setZoom(1);
		
		//reset guessMarker position to {lat: 0, lng: 0}
		guessMarker.position = zeroPosition;
		
		//Reset targetMarker + targetPath, i.e. hide them from map
        targetMarker.setMap(null);
        targetMarker = null;
        targetPath.setMap(null);
        targetPath = null;		    
    }
    catch(err) {}
    finally {
        var sv = new google.maps.StreetViewService();
        sv.getPanorama({location: {lat: getRandomLatLng(90), lng: getRandomLatLng(180)}, preference: 'best', radius: 100000, source: 'outdoor'}, processSVData);
        
    }
}

function processSVData(data, status) 
{
    if (status === 'OK') {
        panorama.setPano(data.location.pano);
        startLoc = panorama.getPano();
    } else 
        newSpot();
}

function getRandomLatLng(max) 
{
    var num = Math.random() * Math.floor(max);
    if(Math.random() > 0.5) num = num * -1;
    return num;
}

function createControl(controlDiv, desc, content, bSize, fSize) 
{
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = bSize + " solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = desc;
    controlDiv.appendChild(controlUI);
	
    // Set CSS for the control interior.
    const controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Comic Sans MS,Arial,sans-serif";
    controlText.style.fontSize = fSize;
    controlText.style.lineHeight = "20px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = content;
    controlUI.appendChild(controlText);
    return controlUI;
}

function moveMarker(pnt) 
{
    guessMarker.position = pnt;
}

async function submitGuess()
{
	const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
	
	var gameDuration = formatTime((new Date().getTime() - startTime) / 1000);
	var panPosition = panorama.getPosition();
	var guessMarkerPosition = guessMarker.position;
	
	try {
		//Remove click listener so that guessMarker cannot be moved until new game starts
        google.maps.event.clearListeners(map, 'click');
		
		//Reset targetMarker + targetPath
		targetMarker.setMap(null);
        targetMarker = null;
        targetPath.setMap(null);
        targetPath = null;			
    }
    catch (err) {
	
	}
	finally {
		var distanceText = "";
		var distanceToTarget = google.maps.geometry.spherical.computeDistanceBetween(
    		panPosition,
    		guessMarkerPosition
		);
		
		if (distanceToTarget < 1000) {
			distanceText = distanceToTarget.toFixed(2) + " m";
		}
		else {
			distanceText = (distanceToTarget/1000).toFixed(3) + " km";
		}
		
		replyText = '<div id="result">'+'<b>Result:</b><br>Distance: '  + distanceText + "  <br>" + 'Time: ' + gameDuration + "</div>";
		
		
		//Create PinElement for targetMarker
  		const pinTargetMarker = new PinElement({
			scale: 0.7,
			background: "#1CEC12",
			borderColor: "black",
			glyphColor: "black",
  		});
		
		//Create marker for showing target
		targetMarker = new AdvancedMarkerElement ({
  			map: map,
			position: panPosition,
			draggable: false,
			title: "Target",
			content: pinTargetMarker.element,
  		});
		
		//Set path coordinates (guess -> target)
		var pathCoordinates = [
            targetMarker.position,
            guessMarker.position
        ];
		
		//Create path
		targetPath = new google.maps.Polyline({
        	path: pathCoordinates,
            geodesic: true,
            strokecolor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
		
		targetPath.setMap(map);
		
		//Show result popup
        displayPopup(replyText, map, targetMarker);
		
	}
}

function formatTime(seconds) {
    var timeString;
    if (seconds < 60) 
        timeString = seconds.toFixed(2) + " s"
    else if (seconds < 3600)
        timeString = Math.floor(seconds/60) +  " m " + (seconds%60).toFixed(2) + " s";
    else
        timeString = Math.floor(seconds/3600) +  " h" + (seconds%3600).toFixed(2) + " m" + ((seconds%3600)%60).toFixed(2) + " s";
    return timeString
}

function displayPopup(contentString, map, marker)
{
        var infoWindow = new google.maps.InfoWindow({
            content: contentString,
        });
    infoWindow.open(map, marker);
}
