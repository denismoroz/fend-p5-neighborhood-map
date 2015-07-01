
var Places = [
	{
		name: 'National Library of Belarus',
		site: 'http://www.belarus.by/en/about-belarus/architecture/national-library'
	},
	{
		name: 'Victory Square, Minsk',
		site: 'http://www.belarus.by/en/travel/belarus-life/victory-square'
	},
	{
		name: 'Minsk Arena',
		site: 'http://www.belarus.by/en/about-belarus/architecture/minsk-arena'
	},
	{
		name: 'Dudutki Museum',
		site: 'http://www.dudutki.by/en/'
	},
	{
		name: 'Church of Saints Simon and Helena',
		site: ''
	},

	{
		name: 'Victory Park, Minsk',
		site: ''
	},
	{
		name: 'Stalin Line',
		site: 'http://stalin-line.by/'
	}
];

var Place = function (data) {
	this.name = ko.observable(data.name);
	this.site = ko.observable(data.site);
};


var ViewModel = function() {
	var self = this;

	this.placesFilterString = ko.observable();
	this.selectedPlaces = ko.observableArray([]);

	Places.forEach(function(place) {
		self.selectedPlaces.push(new Place(place));
	});


	this.markers = [];

	self.removeMarkers = function() {
		self.markers.forEach(function(marker) {
			marker.setMap(null);
		});
	};

	/*
	  createMapMarker(placeData) reads Google Places search results to create map pins.
	  placeData is the object returned from search results containing information
	  about a single location.
	*/
	self.createMapMarker = function (placeData) {

		// The next lines save location data from the search result object to local variables
		var lat = placeData.geometry.location.lat();  // latitude from the place service
		var lon = placeData.geometry.location.lng();  // longitude from the place service
		var name = placeData.formatted_address;   // name of the place from the place service
		            // current boundaries of the map window

		// marker is an object with additional data about the pin for a single location
		var marker = new google.maps.Marker({
			map: self.map,
			position: placeData.geometry.location,
			title: name
		});

		this.markers.push(marker);

		// infoWindows are the little helper windows that open when you click
		// or hover over a pin on a map. They usually contain more information
		// about a location.
		var infoWindow = new google.maps.InfoWindow({
			content: name
		});

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.open(self.map, marker);
		});

		self.bounds.extend(new google.maps.LatLng(lat, lon));
		self.map.fitBounds(self.bounds);
		self.map.setCenter(self.bounds.getCenter());
	};

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

		self.removeMarkers();
		// creates a Google place search service object. PlacesService does the work of
		// actually searching for location data.
		var service = new google.maps.places.PlacesService(self.map);
		// Iterates through the array of locations, creates a search object for each location
		var places = self.selectedPlaces();
		for (var place in places) {
			// the search request object
			var place_name = places[place].name();
			console.log(place_name);

			var request = {
				query: place_name
			};
			// Actually searches the Google Maps API for location data and runs the callback
			// function with the search results after each search.
			service.textSearch(request, self.addNewPin);
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
			if (place.name.search(regex) != -1) {
				self.selectedPlaces.push(new Place(place));
			}
		});
		self.pinPoster();
	};
}

ko.applyBindings(new ViewModel);

