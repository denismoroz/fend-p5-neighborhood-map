
var Places = [
	{
		name: 'National Library of Belarus',
		site: 'http://www.belarus.by/en/about-belarus/architecture/national-library',
		icon: 'images/library.png'
	},
	{
		name: 'Victory Square, Minsk',
		site: 'http://www.belarus.by/en/travel/belarus-life/victory-square',
		icon: 'images/citysquare.png'
	},
	{
		name: 'Minsk Arena',
		site: 'http://www.belarus.by/en/about-belarus/architecture/minsk-arena',
		icon: 'images/bike_rising.png'
	},
	{
		name: 'Dudutki Museum',
		icon: 'images/museum_openair.png',
		site: 'http://www.dudutki.by/en/'
	},
	{
		name: 'Church of Saints Simon and Helena',
		icon: 'images/church.png',
		site: ''
	},

	{
		name: 'Victory Park, Minsk',
		icon: 'images/forest.png',
		site: ''
	},
	{
		name: 'Stalin Line',
		icon: 'images/museum_war.png',
		site: 'http://stalin-line.by/'
	}
];

var Place = function (data) {
	this.name = ko.observable(data.name);
	this.site = ko.observable(data.site);
	this.data = data;
};


var ViewModel = function() {
	var self = this;

	this.placesFilterString = ko.observable();
	this.selectedPlaces = ko.observableArray([]);

	Places.forEach(function(place) {
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
	};
}

ko.applyBindings(new ViewModel);


