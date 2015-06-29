
var Places = [
	{
		name: 'National Library of Belarus',
		site: 'http://www.belarus.by/en/about-belarus/architecture/national-library'
	},
	{
		name: 'Victory Square',
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
		name: 'Victory Park',
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

	self.filterPlaces = function() {
		var filter = self.placesFilterString()
		this.selectedPlaces.removeAll();
		var regex = new RegExp(filter, "i");
		Places.forEach(function(place) {
			if (place.name.search(regex) != -1) {
				self.selectedPlaces.push(new Place(place));
			}
		});
	};
}

ko.applyBindings(new ViewModel);


