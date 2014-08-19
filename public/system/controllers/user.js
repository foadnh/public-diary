'use strict';

angular.module('mean.system').controller(
	'UserCtrl', ['$scope', 'Global', 'Diary', 'User', '$modal', '$stateParams', '$location',
		function($scope, Global, Diary, User, $modal, $stateParams, $location) {

			$scope.userAccess = Global.authenticated ? true : false;

			$scope.user = $stateParams.user;

			$scope.yourself = false;
			if (Global.user && Global.user._id === $scope.user)
				$scope.yourself = true;

			$scope.followed = Global.user.follows.indexOf($scope.user) === -1 ? false : true;
			$scope.follow = function() {
				User.follow($scope.user, function(result) {
					Global.user.follows.push($scope.user);
					$scope.followed = true;
				});
			};
			$scope.unfollow = function() {
				User.unfollow($scope.user, function(result) {
					Global.user.follows.splice(Global.user.follows.indexOf($scope.user), 1);
					$scope.followed = false;
				});
			};

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
