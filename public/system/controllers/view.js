'use strict';

angular.module('mean.system').controller('ViewCtrl', ['$scope', 'Diary',
	function($scope, Diary) {
		$scope.viewById = function() {
			$scope.idResult = Diary.getId($scope.diaryId);
			console.log($scope.idResult);
		};
	}
]);
