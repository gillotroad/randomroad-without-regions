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

function initPano() {
  const searchParams = new URLSearchParams(window.location.search);
  const latparam = +searchParams.get('lat');
  const longparam = +searchParams.get('long');
  const position = { lat: latparam, lng: longparam };
  // Note: constructed panorama objects have visible: true
  // set by default.
  const panorama = new google.maps.StreetViewPanorama(
    document.getElementById("map"),
    {
      position: position,
      addressControl: false,
      linksControl: true,
      panControl: true,
      enableCloseButton: false,
      disableDefaultUI: false,
    },
  );

  
  console.log("lat = ");
  console.log(latparam);
  console.log("long = ");
  console.log(longparam);
}


window.initPano = initPano;
