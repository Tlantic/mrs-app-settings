/**
The Settings service is responsible for loading setting files from server.

@class MRSAppSettings
@namespace MRS.App.Settings
@since 0.1.0
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
            return result.data.result;
        }
        
    };
    
}]);