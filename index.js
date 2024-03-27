/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/*
Description:
Opens Google Street View at desired location using latitude and longitude parameters.
The Street View will have limited commands, specifically not showing links to the original Google Maps page.

Manual:
Call website passing arguments "lat" and "long" copied from Google Street View adress line.
Example:
https://gillotroad.github.io/lockedstreetview/?lat=38.721172&long=-106.7827289

*/

var marker, startTime, path, panorama, startLoc, currentLatLong;


function initPano() {
  const zeroPosition = { lat: 0, lng: 0 };
  // Note: constructed panorama objects have visible: true
  // set by default.
  //
  
  newSpot();
  

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
  controlUI = createControl(newGameControlDiv, "Starts a New Game Session", "New Game");
  controlUI.addEventListener("click", () => {
  		newSpot();
  });
  panorama.controls[google.maps.ControlPosition.TOP_RIGHT].push(newGameControlDiv);
  
  
  
  currentLatLong = panorama.getPosition();
  console.log("lat = ");
  console.log(currentLatLong.lat);
  console.log("long = ");
  console.log(currentLatLong.long);
}


window.initPano = initPano;

function newSpot() 
{
    startTime = new Date().getTime();
    try {
        marker.setMap(null);
        marker = null;
        path.setMap(null);
        path = null;
        
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

function createControl(controlDiv, desc, content) 
{
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "5px solid #fff";
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
    controlText.style.fontSize = "25px";
    controlText.style.lineHeight = "20px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = content;
    controlUI.appendChild(controlText);
    return controlUI;
}
