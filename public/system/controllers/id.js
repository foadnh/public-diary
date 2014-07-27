'use strict';

angular.module('mean.system').controller('IdCtrl', ['$scope', 'Global', 'Diary', '$stateParams', '$location', '$modal',
	function($scope, Global, Diary, $stateParams, $location, $modal) {

		$scope.userAccess = Global.authenticated ? true : false;

		Diary.getId($stateParams.diaryId,
			function(err) {
				console.log(err);
				$location.path('/');
			},
			function(result) {
				$scope.diary = result;

				if (Global.user && $scope.diary.user === Global.user._id)
					$scope.editAccess = true;
				else
					$scope.editAccess = false;

				$scope.diary.tagsObj = [];
				var tagsObj = $scope.diary.tagsObj,
					tags = $scope.diary.tags;
				for (var i = 0, j = tags.length; i < j; i++) {
					tagsObj.push({
						text: tags[i]
					});
				}

				if ($scope.diary.votes.indexOf(Global.user._id) === -1)
					$scope.liked = false;
				else
					$scope.liked = true;
			}
		);

		$scope.viewModifiesList = function() {

			var viewModifiesListCtrl = function($scope, $modalInstance, items) {

				$scope.close = function() {
					$modalInstance.dismiss('close');
				};
			};

			var modalInstance = $modal.open({
				templateUrl: '/public/system/views/view-modifies-list.html',
				scope: $scope,
				controller: viewModifiesListCtrl,
				size: 'sm',
				resolve: { // What is this exactly?
					items: function() {
						return $scope.diaries;
					}
				}
			});

			modalInstance.result.then(function() {}, function() {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
		$scope.toggleLike = function() {
			Diary.toggleLike($scope.diary._id, function(result) {
				if ($scope.liked === false)
					$scope.diary.vote += 1;
				else
					$scope.diary.vote -= 1;
				$scope.liked = !$scope.liked;
			});
		};

		$scope.edit = function() {
			$scope.editDiary = {
				title: $scope.diary.title,
				text: $scope.diary.text,
			};
			$scope.editMode = true;
		};
		$scope.save = function() {
			delete $scope.editMode;
			if ($scope.editDiary.title !== $scope.diary.title ||
				$scope.editDiary.text !== $scope.diary.text) {
				Diary.edit($scope.diary._id, $scope.editDiary, function(diary) {
					$scope.diary = diary;
				});
			}
			delete $scope.editDiary;
		};

		$scope.editTags = function() {
			$scope.tagsChanged = true;
		};
		$scope.saveTags = function() {
			var tagsObj = $scope.diary.tagsObj,
				tags = [];
			for (var i = 0, j = tagsObj.length; i < j; i++) {
				tags.push(tagsObj[i].text);
			}
			$scope.diary.tags = tags;
			Diary.editTags($scope.diary._id, $scope.diary, function() {
				delete $scope.tagsChanged;
			});
		};

		$scope.delete = function() {
			Diary.delete($scope.diary._id, function() {
				$location.path('/');
			});
		};

		$scope.cancel = function() {
			delete $scope.diary;
			delete $scope.editMode;
		};

		$scope.mediumOptions = {
			placeholder: 'Diary text',
			buttons: ['bold', 'italic', 'underline', 'strikethrough', 'quote', 'direction'],
			disableDoubleReturn: true,
		};
		var Direction = function() {
			this.button = document.createElement('button');
			this.button.className = 'medium-editor-action';
			this.button.innerHTML = '<b>RTL</b>';
			console.log(this.button);
			this.button.onclick = this.onClick.bind(this);
		};
		Direction.prototype.onClick = function() {
			var selected = document.getSelection();
			if (selected.anchorNode.parentNode.dir === 'rtl')
				selected.anchorNode.parentNode.dir = 'ltr';
			else
				selected.anchorNode.parentNode.dir = 'rtl';
		};
		Direction.prototype.getButton = function() {
			return this.button;
		};
		Direction.prototype.checkState = function(node) {
			if (node.dir === 'rtl')
				this.button.classList.add('medium-editor-button-active');
		};

		$scope.mediumBindOptions = {
			extensions: {
				'direction': new Direction()
			}
		};

	}
]);
