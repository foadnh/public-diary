'use strict';

angular.module('mean.system').controller('IndexCtrl', ['$scope', 'Global', 'Diary', '$http', '$modal',
	function($scope, Global, Diary, $http, $modal) {

		$scope.userAccess = Global.authenticated ? true : false;


		$scope.location = {
			latitude: 0,
			longitude: 0
		};
		var ipLoc = function() {
			$http.get('http://ipinfo.io/json').success(function(result) {
				$scope.location.latitude = result.loc.split(',')[0];
				$scope.location.longitude = result.loc.split(',')[1];
				$scope.map.zoom = 6;
			});
		};
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				$scope.location.latitude = position.coords.latitude;
				$scope.location.longitude = position.coords.longitude;
				$scope.map.zoom = 15;
				$scope.$apply();
			}, function(err) {
				console.log(err);
				ipLoc();
			});
		} else {
			ipLoc();
		}

		$scope.meta = {
			pageSize: 20,
			page: 1
		};
		$scope.sortVal = '{"sort":"createdDate","order":-1}';

		var getDiaries = function() {
			Diary.getBox($scope.map.box, $scope.meta.pageSize, $scope.meta.page, JSON.parse($scope.sortVal), function(result) {
				$scope.meta.wholeSize = result.wholeSize;
				var diaries = result.diaries;
				for (var i = 0, j = diaries.length; i < j; i++) {
					diaries[i].mloc = {};
					diaries[i].mloc.latitude = diaries[i].loc[0];
					diaries[i].mloc.longitude = diaries[i].loc[1];
				}
				$scope.diaries = diaries;
			});
		};

		$scope.sort = function() {
			getDiaries();
		};

		$scope.$watch('meta.page', function(newVal) {
			if ($scope.map.box)
				getDiaries();
		});

		$scope.map = {
			zoom: 1,

			events: {
				'click': function(mapModel, eventName, originalEventArgs) {
					var e = originalEventArgs[0];
					$scope.lat = e.latLng.lat();
					$scope.lng = e.latLng.lng();

					var marker = {
						latitude: e.latLng.lat(),
						longitude: e.latLng.lng()
					};
					$scope.map.marker = marker;

					$scope.$apply();
				},
				'idle': function(mapModel, eventName, originalEventArgs) {
					var sw = mapModel.getBounds().getSouthWest(),
						ne = mapModel.getBounds().getNorthEast();
					$scope.map.box = {
						x1: sw.lat(),
						y1: sw.lng(),
						x2: ne.lat(),
						y2: ne.lng()
					};
					$scope.meta.page = 1;
					getDiaries();
				}
			},

			marker: {
				latitude: undefined,
				longitude: undefined
			},

			window: {
				options: {
					boxClass: 'custom-info-window'
				},
				show: true
			}

		};

		$scope.viewDiary = function(index) {
			$modal.open({
				templateUrl: '/public/system/views/view-diary.html',
				scope: $scope,
				controller: 'viewDiaryCtrl',
				resolve: {
					index: function() {
						return index;
					}
				}
			});
		};

		$scope.viewCreate = function() {
			$modal.open({
				templateUrl: '/public/system/views/view-create.html',
				scope: $scope,
				controller: 'viewCreateCtrl',
			});
		};

		$scope.test = function() {alert()};

	}
]);
