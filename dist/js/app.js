var Places=[{name:"National Library of Belarus",icon:"images/library.png"},{name:"Victory Square, Minsk",icon:"images/citysquare.png"},{name:"Minsk Arena",icon:"images/bike_rising.png"},{name:"Dudutki Museum",icon:"images/museum_openair.png"},{name:"Church of Saints Simon and Helena",icon:"images/church.png"},{name:"Victory Park, Minsk",icon:"images/forest.png"},{name:"Stalin Line",icon:"images/museum_war.png"}],Place=function(data){"use strict";this.name=ko.observable(data.name),this.data=data},ImagesLoader=function(){"use strict";var self=this;self.apiKey="6c64e861d08e001df254252d9e8ff9a1",self.sliderTemplate='<div id="slider"><div class="pictures" u="slides" ></div><span u="arrowleft" class="jssora01l"></span><span u="arrowright" class="jssora01r"></span></div>',self.$sliderContainer=$(".slider-container"),self.$placeName=$(".place-name"),self.showError=function(message){self.$sliderContainer.html("<h3> "+message+"</h3>")},self.loadPlaces=function(places){places.forEach(function(place){self.loadImages(place)})},self.loadImages=function(place){var url="https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+self.apiKey+"&safe_search=1&per_page=20&jsoncallback=?";$.getJSON(url,{text:place.name(),tags:place.name(),format:"json"},function(data){var images=[];data.photos.photo.forEach(function(photo){var url="https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg";url=url.replace("{farm-id}",photo.farm),url=url.replace("{server-id}",photo.server),url=url.replace("{id}",photo.id),url=url.replace("{secret}",photo.secret),images.push(url)}),place.data.images=images}).fail(function(){self.showError("Failed to load images from Flickr, please try later")})},self.showImages=function(place){function scaleSlider(){var parentWidth=$(".slider").parent().width();parentWidth?slider.$ScaleWidth(parentWidth):window.setTimeout(scaleSlider,30)}$("#slider").remove(),self.$sliderContainer.append(self.sliderTemplate);var options,slider,$pictures=$(".pictures");place.data.images.forEach(function(image){var slide='<div class="slide"><img class="img-responsive" u="image" src="'+image+'" /></div>';$pictures.append(slide)}),options={$DragOrientation:3,$SlideDuration:500,$ArrowNavigatorOptions:{$Class:$JssorArrowNavigator$,$ChanceToShow:2,$AutoCenter:0,$Steps:1}},slider=new $JssorSlider$("slider",options),scaleSlider(),$(window).bind("load",scaleSlider),$(window).bind("resize",scaleSlider),$(window).bind("orientationchange",scaleSlider),self.$placeName.text(place.name())}},MapController=function(viewModel){"use strict";var self=this;self.viewModel=viewModel,self.showError=function(message){$(".map").append("<h3>"+message+"</h3>")},self.createMapMarker=function(place,placeData){var lat=placeData.geometry.location.lat(),lon=placeData.geometry.location.lng(),name=place.name(),marker=new google.maps.Marker({map:self.map,position:placeData.geometry.location,title:name,icon:place.data.icon}),infoWindow=new google.maps.InfoWindow({content:name});place.data.infoWindow=infoWindow,place.data.marker=marker,google.maps.event.addListener(marker,"click",function(){self.viewModel.onPlaceClick(place)}),self.bounds.extend(new google.maps.LatLng(lat,lon)),self.map.fitBounds(self.bounds),self.map.setCenter(self.bounds.getCenter())},self.showInfoWindow=function(place){return void 0===place.data.infoWindow?void self.showError("Google Maps Components are not loaded. Please try later."):(place.data.infoWindow.open(self.map,place.data.marker),place.data.marker.setAnimation(google.maps.Animation.BOUNCE),void setTimeout(function(){place.data.marker.setAnimation(null)},1e3))},self.addNewPin=function(results,status){status===google.maps.places.PlacesServiceStatus.OK&&self.createMapMarker(results[0])},self.loadPlaces=function(places){if(void 0===window.google)return void self.showError("Failed to load Google.PlacesService to request places information");var request,place_name,service=new google.maps.places.PlacesService(self.map);places.forEach(function(place){place_name=place.name(),request={query:place_name},service.textSearch(request,function(place){return function(results,status){status===google.maps.places.PlacesServiceStatus.OK&&self.createMapMarker(place,results[0])}}(place))})},self.showMarkers=function(places){Places.forEach(function(place){null!==place.marker&&place.marker.setMap(null)});var place_i,place,places_size=places.length;for(place_i=0;places_size>place_i;place_i+=1)place=places[place_i],null!==place.data.marker&&place.data.marker.setMap(self.map);self.map.fitBounds(self.bounds)},self.init=function(){var mapOptions={disableDefaultUI:!1};return void 0===window.google?void self.showError("Failed to load Google Map Components, please try later."):(self.map=new google.maps.Map(document.querySelector(".map"),mapOptions),self.bounds=new google.maps.LatLngBounds,void window.addEventListener("resize",function(){self.map.fitBounds(self.bounds)}))},self.init()},ViewModel=function(){"use strict";var self=this;self.init=function(){this.placesFilterString=ko.observable(),this.selectedPlaces=ko.observableArray([]),self.imageLoader=new ImagesLoader,self.mapController=new MapController(self),Places.forEach(function(place){self.selectedPlaces.push(new Place(place))});var selectedPlaces=self.selectedPlaces();self.mapController.loadPlaces(selectedPlaces),self.imageLoader.loadPlaces(selectedPlaces)},self.onPlaceClick=function(place){self.mapController.showInfoWindow(place),self.imageLoader.showImages(place)},self.filterPlaces=function(){var filter=self.placesFilterString(),regex=new RegExp(filter,"i");this.selectedPlaces.removeAll(),Places.forEach(function(place){-1!==place.name.search(regex)&&self.selectedPlaces.push(new Place(place))}),this.mapController.showMarkers(self.selectedPlaces())},self.init()};ko.applyBindings(new ViewModel);