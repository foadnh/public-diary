'use strict';

angular.module('mean.system').controller(
	'viewDiaryCtrl', ['$scope', 'Global', 'Diary', '$modal', '$modalInstance', 'index',
		function($scope, Global, Diary, $modal, $modalInstance, index) {

			$scope.diaryIndex = index;

			if (Global.user && $scope.diaries[index].user === Global.user._id)
				$scope.editAccess = true;
			else
				$scope.editAccess = false;

			$scope.diaries[index].tagsObj = [];
			var tagsObj = $scope.diaries[index].tagsObj,
				tags = $scope.diaries[index].tags;
			for (var i = 0, j = tags.length; i < j; i++) {
				tagsObj.push({
					text: tags[i]
				});
			}

			if ($scope.diaries[index].votes.indexOf(Global.user._id) === -1)
				$scope.liked = false;
			else
				$scope.liked = true;

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
			$scope.toggleLike = function(index) {
				Diary.toggleLike($scope.diaries[index]._id, function(result) {
					if ($scope.liked === false)
						$scope.diaries[index].vote += 1;
					else
						$scope.diaries[index].vote -= 1;
					$scope.liked = !$scope.liked;
				});
			};

			$scope.edit = function(index) {
				$scope.diary = {
					_id: $scope.diaries[index]._id,
					title: $scope.diaries[index].title,
					text: $scope.diaries[index].text,
				};
				$scope.editMode = true;
			};
			$scope.save = function(index) {
				delete $scope.editMode;
				if ($scope.diary.title !== $scope.diaries[index].title ||
					$scope.diary.text !== $scope.diaries[index].text) {
					Diary.edit($scope.diary._id, $scope.diary, function(diary) {
						diary.mloc = {
							latitude: diary.loc[0],
							longitude: diary.loc[1]
						};
						$scope.diaries[index] = diary;
					});
				}
				delete $scope.diary;
			};

			$scope.editTags = function() {
				$scope.tagsChanged = true;
			};
			$scope.saveTags = function(index) {
				var tagsObj = $scope.diaries[index].tagsObj,
					tags = [];
				for (var i = 0, j = tagsObj.length; i < j; i++) {
					tags.push(tagsObj[i].text);
				}
				$scope.diaries[index].tags = tags;
				Diary.editTags($scope.diaries[index]._id, $scope.diaries[index], function() {
					delete $scope.tagsChanged;
				});
			};

			$scope.delete = function(index) {
				Diary.delete($scope.diaries[index]._id, function() {
					$scope.diaries.splice(index, 1);
					$scope.close();
				});
			};

			$scope.close = function() {
				$scope.cancel(); // Need an external function( cancel() ) to access main $scope.
				$modalInstance.dismiss('close');
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
