'use strict';

angular.module('mean.system').controller(
	'UserCtrl', ['$scope', 'Global', 'Diary', '$http', '$modal', '$stateParams', '$location',
		function($scope, Global, Diary, $http, $modal, $stateParams, $location) {

			$scope.userAccess = Global.authenticated ? true : false;

			$scope.user = $stateParams.user;

			$scope.meta = {
				pageSize: 20,
				page: 1
			};
			$scope.sortVal = '{"sort":"createdDate","order":-1}';

			var getDiaries = function() {
				Diary.getUser($scope.user, $scope.meta.pageSize, $scope.meta.page, JSON.parse($scope.sortVal), function(result) {
					$scope.meta.wholeSize = result.wholeSize;
					$scope.diaries = result.diaries;
				});
			};

			$scope.sort = function() {
				getDiaries();
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
