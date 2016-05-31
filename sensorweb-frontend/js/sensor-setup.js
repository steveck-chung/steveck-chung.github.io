'use strict';

(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const GEOCODE_URL =
    'https://maps.googleapis.com/maps/api/geocode/json?address=';
  const API_KEY = '&key=AIzaSyAWlJoUn2DS8XUYilLXZE8dxYEXbo6dnaE';
  const TOAST_DUR = 4000;

  var userId = $.url().param('id');
  var session = $.url().param('session');
  var sensorName = $('#sensor-name');
  var sensorLocation = $('#sensor-location');
  var sensorDescription = $('#sensor-description');
  var sensorProject = $('#sensor-project');
  var sensorCoords;
  var gMap;

  $('select').material_select();

  $('#setup-sensor').click(function() {
    if (!sensorCoords) {
      Materialize.toast('Please check your address on the map', TOAST_DUR);
      return;
    }

    var name = sensorName.val();
    var projectKey = sensorProject.val();
    $.ajax({
      type: 'POST',
      url: API_URL + 'projects/' + projectKey + '/sensors',
      data: {
        userId: userId,
        session: session,
        name: name,
        description: sensorDescription.val(),
        address: sensorLocation.val(),
        // XXX: Need String type here.
        coords: JSON.stringify(sensorCoords),
        // TOOD: Please add the google token here.
        token: 'Google token'
      },
      dataType: 'json'
    })
    .done(function(result) {
      if (result.result === 'success') {
        window.location = './user.html?id=' + userId;
      } else {
        alert(result.message);
      }
    })
    .fail(function(err) {
      console.error(err);
    });
  });

  $('#check-addr-btn').click(function() {
    var address = sensorLocation.val();

    if (!address) {
      return;
    }

    var formattedAddr = address.split(' ').join('+');
    $.ajax({
      url: GEOCODE_URL + formattedAddr + API_KEY
    })
    .done(function(data) {
      if (!data.results[0]) {
        return;
      }

      sensorCoords = data.results[0].geometry.location;
      gMap = new google.maps.Map(document.getElementById('location-map'), {
        zoom: 16,
        center: sensorCoords
      });

      var gMapMarker = new google.maps.Marker({
        position: sensorCoords,
        map: gMap,
        draggable:true,
        animation: google.maps.Animation.DROP
      });

      google.maps.event.addListener(gMapMarker, 'dragend', function() {
        sensorCoords = gMapMarker.getPosition().toJSON();
      });
    })
    .fail(function(error) {
      console.error(error);
    });
  });

  function initMap() {
    gMap = new google.maps.Map(document.getElementById('location-map'), {
      zoom: 1,
      center: {lat: 0, lng: 0}
    });
  }

  exports.initMap = initMap;

})(window);
