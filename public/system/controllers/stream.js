'use strict';

angular.module('mean.system').controller(
	'StreamCtrl', ['$scope', 'Global', 'Diary', '$modal', '$stateParams', '$location',
		function($scope, Global, Diary, $modal, $stateParams, $location) {

			if (!Global.authenticated)
				$location.path('/');

			$scope.meta = {
				pageSize: 20,
				page: 1
			};

			var getDiaries = function() {
				Diary.getStream($scope.meta.pageSize, $scope.meta.page, function(result) {
					$scope.meta.wholeSize = result.wholeSize;
					$scope.diaries = result.diaries;
				});
			};

			$scope.$watch('meta.page', function(newVal) {
				getDiaries();
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
		}
	]);
