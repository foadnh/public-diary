'use strict';

angular.module('mean.system').controller('AdminDiaryCtrl', ['$scope', 'Global', 'Diary', '$location',
	function($scope, Global, Diary, $location) {
		if (!Global.isAdmin)
			$location.path('/');

		$scope.getDiary = function() {
			Diary.adminGetId($scope.diaryId, function(result) {
				console.log(result);
				$scope.diary = result;
				$scope.editDiary = JSON.parse(JSON.stringify(result));
				$scope.editDiary.removeImage = false;
			});
		};

		$scope.save = function() {
			Diary.adminEdit($scope.diary._id, $scope.editDiary, function(diary) {
				$scope.diary = diary;
				$scope.editDiary.removeImage = false;
			});
		};

		$scope.delete = function() {
			Diary.adminDelete($scope.diary._id, function() {
				delete $scope.diary;
			});
		};

	}
]);
