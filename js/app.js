
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
	this.name = ko.observable(data.name);
	this.site = ko.observable(data.site);
	this.data = data;
};


var ImagesLoader = function() {
	var apiKey = '6c64e861d08e001df254252d9e8ff9a1';
	var self = this;

	self.sliderTemplate = '<div id="slider">' +
				'<div id="pictures" u="slides" ></div>' +
				'<span u="arrowleft" class="jssora01l"></span>' +
				'<span u="arrowright" class="jssora01r"></span>' +
			'</div>'

	self.$sliderContainer = $('.slider-container');
	self.$placeName = $('#place-name');

	self.loadPlacePictures = function (place) {

		//query the Flickr API
		var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&' +
			'api_key=' + apiKey + '&' +
			'safe_search=1&per_page=20&jsoncallback=?'

		$.getJSON(url,
			{
				text: place.name,
				tags: place.name,
				format: "json"
			},
			function(data) {
			var images = []
				$.each(data.photos.photo, function(i, photo) {
					var url = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg'
					url = url.replace('{farm-id}', photo.farm);
					url = url.replace('{server-id}', photo.server);
					url = url.replace('{id}', photo.id);
					url = url.replace('{secret}', photo.secret);
					images.push(url);
				});
				place.images = images;
			}
		);
	}

	self.showImages = function (place) {
		$('#slider').remove();
		self.$sliderContainer.append(self.sliderTemplate);

		var $pictures = $('#pictures');
		$.each(place.data.images,
			function(i, image){
				var slide = '<div id="slide"><img class="img-responsive" u="image" src="' + image + '" /></div>';
				$pictures.append(slide);
			}
		);

		var options = {
				$DragOrientation: 3,                                //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
				$SlideDuration: 500,                                //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500

				$ArrowNavigatorOptions: {                       //[Optional] Options to specify and enable arrow navigator or not
					$Class: $JssorArrowNavigator$,              //[Requried] Class to create arrow navigator instance
					$ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
					$AutoCenter: 0,                                 //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
					$Steps: 1                                       //[Optional] Steps to go for each navigation request, default value is 1
				}
		};


		var jssor_slider1 = new $JssorSlider$('slider', options);


		function scaleSlider() {
			var parentWidth = $('#slider').parent().width();
			if (parentWidth) {
				jssor_slider1.$ScaleWidth(parentWidth);
			}
			else {
				window.setTimeout(scaleSlider, 30);
			}
		}
		scaleSlider();
		$(window).bind("load", scaleSlider);
		$(window).bind("resize", scaleSlider);
		$(window).bind("orientationchange", scaleSlider);
		self.$placeName.text(place.name());
	}
}

var ViewModel = function() {
	var self = this;

	this.placesFilterString = ko.observable();
	this.selectedPlaces = ko.observableArray([]);
	self.imageLoader = new ImagesLoader();


	Places.forEach(function(place) {
		self.imageLoader.loadPlacePictures(place);
		self.selectedPlaces.push(new Place(place));
	});

	/*
	  createMapMarker(placeData) reads Google Places search results to create map pins.
	  placeData is the object returned from search results containing information
	  about a single location.
	*/
	self.createMapMarker = function (place, placeData) {

		// The next lines save location data from the search result object to local variables
		var lat = placeData.geometry.location.lat();  // latitude from the place service
		var lon = placeData.geometry.location.lng();  // longitude from the place service
		var name = place.name();   // name of the place from the place service
		            // current boundaries of the map window

		// marker is an object with additional data about the pin for a single location
		var marker = new google.maps.Marker({
			map: self.map,
			position: placeData.geometry.location,
			title: name,
			icon: place.data.icon
		});

		place.data.marker = marker;

		// infoWindows are the little helper windows that open when you click
		// or hover over a pin on a map. They usually contain more information
		// about a location.
		var infoWindow = new google.maps.InfoWindow({
			content: name
		});

		place.data.infoWindow = infoWindow;

		google.maps.event.addListener(marker, 'click', function() {
			self.showInfoWindow(place);
		});

		self.bounds.extend(new google.maps.LatLng(lat, lon));
		self.map.fitBounds(self.bounds);
		self.map.setCenter(self.bounds.getCenter());
	};

	self.showInfoWindow = function(place) {
		place.data.infoWindow.open(self.map, place.data.marker);
		place.data.marker.setAnimation(google.maps.Animation.BOUNCE);

		setTimeout(function() {
			place.data.marker.setAnimation(null);
		}, 1000);

		self.imageLoader.showImages(place);
	}

	self.addNewPin = function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			self.createMapMarker(results[0]);
		}
	};

	/*
		pinPoster(locations) takes in the array of locations created by locationFinder()
		and fires off Google place searches for each location
	*/
	self.pinPoster = function() {
		// creates a Google place search service object. PlacesService does the work of
		// actually searching for location data.
		var service = new google.maps.places.PlacesService(self.map);
		// Iterates through the array of locations, creates a search object for each location
		var places = self.selectedPlaces();
		for (var place_i in places) {
			// the search request object
			var place = places[place_i];
			var place_name = place.name();
			console.log(place_name);

			var request = {
				query: place_name
			};

			service.textSearch(request, (function(place) {
				return function (results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						self.createMapMarker(place, results[0]);
					}
				}
			})(place));
		}
	};

	self.initMap = function() {
		var mapOptions = {
				disableDefaultUI: false
		};

		self.map = new google.maps.Map(document.querySelector('#map'), mapOptions);
		self.bounds = new google.maps.LatLngBounds();

		window.addEventListener('resize', function(e) {
			self.map.fitBounds(self.bounds);
		});

		self.pinPoster();
	};

	this.initMap();


	self.filterPlaces = function() {
		var filter = self.placesFilterString()
		this.selectedPlaces.removeAll();
		var regex = new RegExp(filter, "i");

		Places.forEach(function(place) {
			var map = null;
			if (place.name.search(regex) != -1) {
				self.selectedPlaces.push(new Place(place));
				map = self.map;
			};

			if (null != place.marker) {
				place.marker.setMap(map);
			};

		});
		self.map.fitBounds(self.bounds);
	};
}

ko.applyBindings(new ViewModel);
