'use strict';

//Setting up route
angular.module('mean.system').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// For unmatched routes:
		$urlRouterProvider.otherwise('/');

		// states for my app
		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'public/system/views/index.html'
			})
			.state('auth', {
				templateUrl: 'public/auth/views/index.html'
			})
			.state('create', {
				url: '/create',
				templateUrl: 'public/system/views/create.html'
			})
			.state('view', {
				url: '/view',
				templateUrl: 'public/system/views/view.html'
			})
			.state('tag', {
				url: '/tag/:tag',
				templateUrl: 'public/system/views/tag.html'
			})
			.state('user', {
				url: '/user/:user',
				templateUrl: 'public/system/views/user.html'
			})
			.state('stream', {
				url: '/stream',
				templateUrl: 'public/system/views/stream.html'
			})
			.state('search', {
				url: '/search/:key',
				templateUrl: 'public/system/views/search.html'
			})
			.state('diary', {
				url: '/diary/:diaryId',
				templateUrl: 'public/system/views/id.html'
			})
			.state('adminDiary', {
				url: '/admin/diary',
				templateUrl: 'public/system/views/admin-diary.html'
			});

	}
])
	.config(['$locationProvider',
		function($locationProvider) {
			$locationProvider.hashPrefix('!');
		}
	]);
