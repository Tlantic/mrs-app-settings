/*! mrs-app-settings - v1.0.1 - 2015-11-10 09:51:31 GMT */
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
/**
 * The Settings service is responsible for loading setting files from server.
 * 
 * @class MRSAppSettings
 * @namespace MRS.App.Settings
 * @since 1.0.0
 **/
angular.module('MRS.App.Settings').factory('MRSAppSettings', ['$mrsappsettingsConfig', '$window', '$log', 'MRSAppSettingsAdapter', 'webProxy',
    function mrsi18nTranslate($config, $window, $log, $adapter, $proxy) {
        
    'use strict';
    
    /**
     * Request modules list from server.
     * 
     * @method requestModulesUpdate
     * @private
     * @param {string[]} modules modules list
     * @return promise
     */
    function requestModulesUpdate(modules) {
        // Connect to server
        var request = $adapter.check.to(modules);
        
        // If there are a new version, just save to kernel settings modules
        function onSuccess(result) {
            result = $adapter.check.from(result);
            
            // Save to settings
            //$window.tlantic.settings.set(module, result);
            return result;
        }
        
        return $proxy.send(request).then(onSuccess);
    }
    
    /**
     * Save a new setting to local MRS.App.Kernel settings.
     * Then, they would be loaded in the next app startup.
     * 
     * @method saveModule
     * @private
     * @param {string} name Setting name
     * @param {Object} value Any value for setting
     */
    function saveModule(name, value) {
        try {
            $window.tlantic.settings.set(name, value);    
        } catch(error) {
            $log.error('MRS.App.Settings', 'Saving setting', error, {name: name, value: value});
        }
    }
    
    /**
     * Check for a new version of settings.
     * Connects to server to get them.
     * If there are new version, save.
     * 
     * @method check
     * @public
     * @param {string[]} modules The modules code string list to check
     * @return promise
     */
    function checkModules(modules) {
        // If there are no modules, use default from config
        if (modules === undefined) {
            modules = $config.modules;
        }
     
        // After fetch on server for modules
        function onSuccess(result) {
            // result must have a list of all settings
            // iterate over them and save
            for(var key in result) {
                saveModule(result[key].code || result[key].module, result[key].value);
            }
            
            return true;
        }
        
        // For each module, ask server
        return requestModulesUpdate(modules).then(onSuccess); 
    }
   
    return {
        check: checkModules
    };
    
}]);