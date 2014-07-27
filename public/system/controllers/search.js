'use strict';

angular.module('mean.system').controller(
	'SearchCtrl', ['$scope', 'Global', 'Diary', '$http', '$modal', '$stateParams', '$location',
		function($scope, Global, Diary, $http, $modal, $stateParams, $location) {

			$scope.userAccess = Global.authenticated ? true : false;

			$scope.key = $stateParams.key;

			$scope.meta = {
				pageSize: 20,
				page: 1
			};

			var getDiaries = function() {
				Diary.search($scope.key, function(result) {
					// $scope.meta.wholeSize = result.wholeSize;
					// $scope.diaries = result.diaries;
					$scope.meta.wholeSize = result.diaries.length;
					$scope.wholeDiaries = result.diaries;
					$scope.diaries = $scope.wholeDiaries.slice(0, $scope.meta.pageSize);
				});
			};

			getDiaries();
			$scope.$watch('meta.page', function(newVal) {
				// getDiaries();
				if ($scope.diaries) {
					var skip = ($scope.meta.page - 1) * $scope.meta.pageSize;
					$scope.diaries = $scope.wholeDiaries.slice(skip, skip + $scope.meta.pageSize);
					console.log($scope.diaries);
				}
			});

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

			/* $scope.search = function() {
				$location.path('/search/' + $scope.searchText);
			};*/
		}
	]);
