/*global angular*/

/**
 * The 'MRS.App.Settings' module provides remote settings fetch and update.
 * @module MRS.App.Settings
 * @requires MRS.App.Core
 * @beta
 **/
angular.module('MRS.App.Settings', ['MRS.App.Core']).config(['$mrsappsettingsConfig', function (config) {
    'use strict';
    
    var defaultConfig = {
        modules: [],
        endpoints: {
            check: {
                url: ''
            }
        }
    };

    // merge config with default
    var mergedConfig = angular.extend({}, defaultConfig, config);
    angular.extend(config, mergedConfig);
}]);