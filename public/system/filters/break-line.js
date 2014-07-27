'use strict';

angular.module('mean.system').filter('breakLine', function() {
	return function(text) {
		if (text !== undefined) {
			return text.replace(/\n/g, '<br>');
		}
	};
});
