/*global ko, $, $JssorArrowNavigator$, $JssorSlider$, window, google, setTimeout, document*/

var Places = [
	{
		name: 'National Library of Belarus',
		icon: 'images/library.png'
	},
	{
		name: 'Victory Square, Minsk',
		icon: 'images/citysquare.png'
	},
	{
		name: 'Minsk Arena',
		icon: 'images/bike_rising.png'
	},
	{
		name: 'Dudutki Museum',
		icon: 'images/museum_openair.png'
	},
	{
		name: 'Church of Saints Simon and Helena',
		icon: 'images/church.png'
	},

	{
		name: 'Victory Park, Minsk',
		icon: 'images/forest.png'
	},
	{
		name: 'Stalin Line',
		icon: 'images/museum_war.png'
	}
];


var Place = function (data) {
	'use strict';
	this.name = ko.observable(data.name);
	this.data = data;
};


/*
	Request images from flickr api and show them in jssor slider
*/

var ImagesLoader = function() {
	'use strict';

	var self = this;

	self.apiKey = '6c64e861d08e001df254252d9e8ff9a1';
	self.sliderTemplate = '<div id="slider">' +
				'<div id="pictures" u="slides" ></div>' +
				'<span u="arrowleft" class="jssora01l"></span>' +
				'<span u="arrowright" class="jssora01r"></span>' +
			'</div>';

	self.$sliderContainer = $('.slider-container');
	self.$placeName = $('#place-name');

	self.showError = function(message) {
		self.$sliderContainer.html('<h3> ' + message + '</h3>');
	};

	self.loadPlaces = function(places) {
		places.forEach(function(place) {
			self.loadImages(place);
		});
	};

	self.loadImages = function (place) {

		//query the Flickr API
		var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&' +
			'api_key=' + self.apiKey + '&' +
			'safe_search=1&per_page=20&jsoncallback=?';

		$.getJSON(url,
			{
				text: place.name(),
				tags: place.name(),
				format: 'json'
			},
			function(data) {
				var images = [];
				data.photos.photo.forEach(function(photo) {
					var url = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg';
					url = url.replace('{farm-id}', photo.farm);
					url = url.replace('{server-id}', photo.server);
					url = url.replace('{id}', photo.id);
					url = url.replace('{secret}', photo.secret);
					images.push(url);
				});
				place.data.images = images;
			}
		)
		.fail(function() {
			self.showError('Failed to load images from Flickr, please try later');
  		});
	};

	/*
		showImages(place) for selected place load images to slider.
	*/
	self.showImages = function (place) {
		$('#slider').remove();
		self.$sliderContainer.append(self.sliderTemplate);

		var $pictures = $('#pictures'),
			options,
			slider;

		place.data.images.forEach(
			function(image){
				var slide = '<div id="slide"><img class="img-responsive" u="image" src="' + image + '" /></div>';
				$pictures.append(slide);
			}
		);

		options = {
			$DragOrientation: 3,     //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
			$SlideDuration: 500,     //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500

			$ArrowNavigatorOptions: {          //[Optional] Options to specify and enable arrow navigator or not
				$Class: $JssorArrowNavigator$, //[Requried] Class to create arrow navigator instance
				$ChanceToShow: 2,              //[Required] 0 Never, 1 Mouse Over, 2 Always
				$AutoCenter: 0,                //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
				$Steps: 1                      //[Optional] Steps to go for each navigation request, default value is 1
			}
		};

		slider = new $JssorSlider$('slider', options);

		function scaleSlider() {
			var parentWidth = $('#slider').parent().width();
			if (parentWidth) {
				slider.$ScaleWidth(parentWidth);
			}
			else {
				window.setTimeout(scaleSlider, 30);
			}
		}
		scaleSlider();
		$(window).bind('load', scaleSlider);
		$(window).bind('resize', scaleSlider);
		$(window).bind('orientationchange', scaleSlider);
		self.$placeName.text(place.name());
	};
};
/*
	This object is responsible for map controlling.
	Load gps coodinates for markers and show/hide them according to selected places set.
*/
var MapController = function(viewModel) {
	'use strict';
	var self = this;
	self.viewModel = viewModel;


	self.showError = function(message) {
		$('#map').append('<h3>' + message + '</h3>');
	};

	/*
	  createMapMarker(place, placeData) reads Google Places search results to create map pins.
	  For later manupulations marker saved in place.data
	  place is a Place object that should be shown by new marker
	  placeData is the object returned from search results containing information
	  about a single location.
	*/
	self.createMapMarker = function (place, placeData) {

		// The next lines save location data from the search result object to local variables
		var lat = placeData.geometry.location.lat(),  // latitude from the place service
			lon = placeData.geometry.location.lng(),  // longitude from the place service
			name = place.name(),   // name of the place from the place service
		            // current boundaries of the map window

			// marker is an place object
			marker = new google.maps.Marker({
				map: self.map,
				position: placeData.geometry.location,
				title: name,
				icon: place.data.icon
			}),

			infoWindow = new google.maps.InfoWindow({
				content: name
			});

		place.data.infoWindow = infoWindow;
		// save marker in a place object for later manupulations
		place.data.marker = marker;

		google.maps.event.addListener(marker, 'click', function() {
			// notify ViewModel about click on the marker that is needed to separate MapController and ImageLoader using ViewModel.
			self.viewModel.onPlaceClick(place);
		});

		self.bounds.extend(new google.maps.LatLng(lat, lon));
		self.map.fitBounds(self.bounds);
		self.map.setCenter(self.bounds.getCenter());
	};

	// showInfoWindow(place) called when user clicks on marker
	self.showInfoWindow = function(place) {
		if (place.data.infoWindow === undefined) {
			self.showError('Google Maps Components are not loaded. Please try later.');
			return;
		}

		place.data.infoWindow.open(self.map, place.data.marker);
		place.data.marker.setAnimation(google.maps.Animation.BOUNCE);

		// Stop animation for marker in 1 second, otherwise marker will jump forever.
		setTimeout(function() {
			place.data.marker.setAnimation(null);
		}, 1000);
	};

	// add a new pin on map, called once on map loading
	self.addNewPin = function(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			self.createMapMarker(results[0]);
		}
	};

	/*
		loadPlaces() goes over places and request Google Place Search for gps coordinates.
		It should be run once to not to send the same request all the time.
	*/
	self.loadPlaces = function(places) {
		// creates a Google place search service object. PlacesService does the work of
		// actually searching for location data.

		if (window.google === undefined) {
			self.showError('Failed to load Google.PlacesService to request places information');
			return;
		}

		var service = new google.maps.places.PlacesService(self.map),
			request,
			place_name;

		// Iterates through the array of places and load info about them.
		places.forEach(function(place) {
			place_name = place.name();
			// the search request object
			request = {
				query: place_name
			};

			service.textSearch(request, (function(place) {
				return function (results, status) {
					if (status === google.maps.places.PlacesServiceStatus.OK) {
						self.createMapMarker(place, results[0]);
					}
				};
			})(place));
		});
	};

	// Show markers for currently selected places. If place in places list then marker is shown,
	// otherwise marker is removed from map
	self.showMarkers = function(places) {
		Places.forEach(function(place) {
			if (null !== place.marker) {
				place.marker.setMap(null);
			}
		});

		var place_i,
			places_size = places.length,
			place;


		for (place_i = 0; place_i < places_size; place_i += 1) {
			place = places[place_i];
			if (null !== place.data.marker) {
				place.data.marker.setMap(self.map);
			}
		}

		self.map.fitBounds(self.bounds);
	};

	/*
		init() creates a map and load places information
	*/
	self.init = function() {
		var mapOptions = {
				disableDefaultUI: false
		};

		if (window.google === undefined) {
			self.showError('Failed to load Google Map Components, please try later.');
			return;
		}

		self.map = new google.maps.Map(document.querySelector('#map'), mapOptions);
		self.bounds = new google.maps.LatLngBounds();

		window.addEventListener('resize', function() {
			self.map.fitBounds(self.bounds);
		});
	};

	self.init();
};

var ViewModel = function() {
	'use strict';

	var self = this;

	self.init = function() {
		this.placesFilterString = ko.observable();
		this.selectedPlaces = ko.observableArray([]);
		self.imageLoader = new ImagesLoader();
		self.mapController = new MapController(self);

		Places.forEach(function(place) {
			self.selectedPlaces.push(new Place(place));
		});

		var selectedPlaces = self.selectedPlaces();
		self.mapController.loadPlaces(selectedPlaces);
		self.imageLoader.loadPlaces(selectedPlaces);
	};

	self.onPlaceClick = function(place) {
		self.mapController.showInfoWindow(place);
		self.imageLoader.showImages(place);
	};

	self.filterPlaces = function() {
		var filter = self.placesFilterString(),
			regex = new RegExp(filter, 'i');

		this.selectedPlaces.removeAll();

		Places.forEach(function(place) {
			if (place.name.search(regex) !== -1) {
				self.selectedPlaces.push(new Place(place));
			}
		});
		this.mapController.showMarkers(self.selectedPlaces());
	};

	self.init();
};

ko.applyBindings(new ViewModel());