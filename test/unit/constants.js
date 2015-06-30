/**
    Set of constants focused on MRS.Core automated tests
**/
angular.module("MRS.App.Settings").constant("$mrsappsettingsConfig", {
	"module": "MRS.App.Settings",
	"modules": ["module1", "module2"],
	"endpoints": {
		"check": {
			"method": "POST",
			"url": "/fake-module-path",
			"cache": true,
			"timestamp": 600000
		}
	}
});