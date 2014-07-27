'use strict';

angular.module('mean.system').controller(
	'viewCreateCtrl', ['$scope', 'Global', 'Diary', '$modal', '$modalInstance', '$upload',
		function($scope, Global, Diary, $modal, $modalInstance, $upload) {

			$scope.diary = {
				showUser: false
			};

			$scope.close = function() {
				delete $scope.diary;
				$modalInstance.dismiss('close');
			};
			$scope.create = function() {
				var tagsObj = $scope.diary.tagsObj,
					tags = [];
				for (var i = 0, j = tagsObj.length; i < j; i++) {
					tags.push(tagsObj[i].text);
				}
				$scope.diary.tags = tags;
				$scope.diary.loc = [$scope.lat, $scope.lng];
				Diary.save($scope.diary, function(result) {
					result.mloc = {
						latitude: result.loc[0],
						longitude: result.loc[1]
					};
					$scope.diaries.push(result);
					$scope.map.marker = {
						latitude: null,
						longitude: null
					};
					$scope.lat = null;
					$scope.lng = null;
					$scope.diary = {};
					$modalInstance.dismiss('create');
					$scope.viewDiary($scope.diaries.length - 1);
				});
			};

			$scope.onFileSelect = function(image) {
				if (angular.isArray(image)) {
					image = image[0];
				}

				if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
					alert('Only PNG and JPEG are accepted.');
					return;
				}

				$scope.uploadInProgress = true;
				$scope.uploadProgress = 0;

				$scope.upload = $upload.upload({
					url: '/diary/image',
					method: 'POST',
					file: image
				}).progress(function(event) {
					$scope.uploadProgress = Math.floor(event.loaded / event.total);
					$scope.$apply();
				}).success(function(data, status, headers, config) {
					$scope.uploadInProgress = false;
					$scope.diary.image = JSON.parse(data);
				}).error(function(err) {
					$scope.uploadInProgress = false;
					console.log('Error uploading file: ' + err.message || err);
				});
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
