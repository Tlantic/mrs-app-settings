/**
 * The Settings adapter is responsible for parsing requests to/from server.
 * 
 * @class MRSAppSettingsAdapter
 * @namespace MRS.App.Settings
 * @since 1.0.0
**/
angular.module('MRS.App.Settings').service('MRSAppSettingsAdapter', ['$mrsappsettingsConfig',
    function mrsi18nTranslate($config) {
        
    'use strict';
    
    this.check = {
        
        to: function checkTo(modules) {
            return angular.extend({}, $config.endpoints.check, {
               data: {
                   settings: modules
               }
            });
        },
        
        from: function checkFrom(result) {
            return Array.isArray(result.data.result) ? result.data.result : [result.data.result];
        }
        
    };
    
}]);