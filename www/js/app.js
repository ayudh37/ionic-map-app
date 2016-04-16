// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, GoogleMaps) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    GoogleMaps.init();
  })
})

.controller('MapCtrl',function($scope, $cordovaCamera, $ionicPopup){

   $scope.showAlert = function(title) {
   var alertPopup = $ionicPopup.alert({
     title: title
   });

   alertPopup.then(function(res) {
     console.log('Thank you for not eating my delicious ice cream cone');
   });
 };

  $scope.takePicture = function() {
        var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
 
        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
            $cordovaFileTransfer.upload("192.168.56.255/upload.php",$scope.imgURI).then(function(result) {
                        $scope.showAlert(response);
            alert("SUCCESS: " + JSON.stringify(result.response));
        }, function(err) {
                        $scope.showAlert(response);

            alert("ERROR: " + JSON.stringify(err));
        });
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }

    $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      console.log(imageURI);
      $scope.lastPhoto = imageURI;
      $cordovaFileTransfer.upload("192.168.56.1/upload.php",imageURI).then(function(result) {
            alert("SUCCESS: " + JSON.stringify(result.response));
        }, function(err) {
            alert("ERROR: " + JSON.stringify(err));
        });

    }, function(err) {
      console.err(err);
    }, {
      quality: 75,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: false
    });
  };

})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");

})

.factory('Markers', function($http) {

  var markers = [];

  return {
    getMarkers: function(){

      return $http.get("http://localhost/ionic-maps/markers.php").then(function(response){
          markers = response;
          return markers;
      });

    }
  }

})

.factory('GoogleMaps', function($cordovaGeolocation, Markers){

  var apiKey = false;
  var map = null;

  function initMap(){

    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){

        //Load the markers
        loadMarkers();

      });

    }, function(error){
      console.log("Could not get location");

        //Load the markers
        loadMarkers();
    });

  }

  function loadMarkers(){

      //Get all of the markers from our Markers factory
      Markers.getMarkers().then(function(markers){

        console.log("Markers: ", markers);

        var records = markers.data.markers;

        for (var i = 0; i < records.length; i++) {

          var record = records[i];   
          var markerPos = new google.maps.LatLng(record.lat, record.lng);

          // Add the markerto the map
          var marker = new google.maps.Marker({
              map: map,
              animation: google.maps.Animation.DROP,
              position: markerPos
          });

          //var infoWindowContent = "<h4>" + record.name + "</h4>";
		    var infoWindowContent = '<IMG BORDER="0" ALIGN="Left" SRC="http://localhost/ionic-maps/GmomsindaHoodz.jpg">'

          addInfoWindow(marker, infoWindowContent, record);
  
        }

      }); 

  }

  function addInfoWindow(marker, message, record) {

      var infoWindow = new google.maps.InfoWindow({
          content: message
      });

      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open(map, marker);
      });
      
  }

  return {
    init: function(){
      initMap();
    }
  }

})
