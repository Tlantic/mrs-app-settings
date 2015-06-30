/*! mrs-app-core - v0.6.0 - 2015-06-23 19:22:01 GMT */
/**
 * The 'MRS.App.Kernel' module is a set of tools to speedup modules and services built within MRS.App applications.
 * 
 * Kernel is a set of "raw" "independent" javascript code to do the "dirty job" in basic situations.
 * It is designed to be very very fast, providing simple methods to help App bootstrap.
 * This code is not supposed to be a "repository" for all snippets in order to act as a "silver bullet".
 * Before adding stuff here, try to reflect if this could should be an AngularJS module or another structure in your project.
 * 
 * @module window.tlantic
 * @since 0.6.0
 */
window.tlantic = (function bootMRSAppKernel() {
    'use strict';

    return {
        // io: new MRSAppKernel_IOPack(),
        // boot: new MRSAppKernel_BootPack(),
        // settings: new MRSAppKernel_SettingsPack()
    };
}());

/**
 * Boot Kernel Pack
 * This kernel pack includes a bootstrap to your application 
 * @class MRSAppKernel_BootPack
 * @constructor
 * @since 0.6.0
 */
 function MRSAppKernel_BootPack() {
    'use strict';
	 
    /**
    * Last AngularJS module loaded by Bootloader.
    * 
    * @attribute bootModule
    * @type {string}
    */
    this.bootModule = "";
    
    /**
    * Last JSON config file loaded by Bootloader.
    * 
    * @attribute bootConfig
    * @type {string}
    */
    this.bootConfig = "";
 }
 
 /**
* Boot apps loading specified angular module (dismissing ng-app usage) based on a JSON config file
*
* @method loadAngApp
* @static
* @param {string} module App main module
* @param {string} file JSON file containing app settings
* @param {boolean} wait4Dom Flag to specify if boot process needs to wait for DOM "ready" event.
* @param {function} cbSuccess Optional Success callback
* @param {function} cbError Optional Failure/Error callback
* @example
*       window.tlantic.boot("MyApp","config.json",true, function(){ //success }, function(){ //error });
*/

MRSAppKernel_BootPack.prototype.loadAngApp = function BootPackloadAngApp(module, file, wait4Dom, cbSuccess, cbError) {
    'use strict';
    
    var self = this,
        
        boot = function loadAngAppBoot(moduleName, configFile) {
            // checks if it is an angularJS app first...
            if (angular === undefined) {
                throw "BOOT ERROR: ANGULARJS NOT FOUND";
            }
            
            // retrieve the module
            try {
                // try to start a new reference
                angular.module(moduleName);
            } catch (e) {
                throw "MODULE <" + moduleName + "> IS NOT DEFINED";
            } finally {
                self.bootModule = moduleName;
                self.bootConfig = configFile;
            }
            
            function onLoadConfigFileSuccess(data) {
                var key,
                    configItem,
                    configKey;
                
                for (key in data) {
                    configItem = data[key];
                    if (configItem.module !== undefined) {
                        try {
                            console.log("MRS-APP-BOOT", configItem.module, JSON.stringify(configItem));
                            
                            // Check if this exists in localstorage
                            configItem = window.tlantic.settings.get(configItem.module) || configItem;
                                                        
                            // Build final config key to be registered as constant
                            configKey = "$" + configItem.module.toLowerCase().replace(/\./gi,'') + "Config";
                            
                            // Save as constant for angular module
                            angular.module(configItem.module).constant(configKey, configItem);
                        } catch (e) {
                            console.error("MRS-APP-BOOT", e);
                        }
                    }
                }
               
                // booting app
                angular.bootstrap(document, [moduleName]);
                
                // calling callback
                if (cbSuccess) {
                    cbSuccess();
                }
            }
            
            function onLoadConfigFileError(status) {
                if (cbError) {
                    cbError(status);
                } else {
                    throw "ERROR LOADING <" + configFile + "> : " + status;
                }
            }
            
            // loading config file
            window.tlantic.io.readJSONFile(
                // configuration file
                configFile,
                // successfull
                onLoadConfigFileSuccess,
                // error reading config file
                onLoadConfigFileError
            );
        };
    
    // handling document loading "timing" issues
    if (wait4Dom) {
        angular.element(document).ready(function loadAngAppWaitForDom() {
            boot(module, file);
        });
    } else {
        boot(module, file);
    }
};

/**
@module window.tlantic
@submodule window.tlantic.boot
@requires window.tlantic.io
@main window.tlantic
**/
window.tlantic.boot = new MRSAppKernel_BootPack();
/**
 * IO Kernel Pack
 * This kernel pack includes some basic IO methods to get or post data to the web or local file system. 
 * @class MRSAppKernel_IOPack
 * @constructor
 * @since 0.6.0
 */
 function MRSAppKernel_IOPack() {
	 'use strict';
	 
 }
 
 /**
* Reads a JSON file into memory.
*
* @method readJSONFile
* @static
* @param {string} filepath Path for file
* @param {function} cbSuccess Success callback
* @param {function} cbError Error callback
*
* @example
*       window.tlantic.io.readJSONFile("myFile.json", function(data){ //success }, function(error){ //error });
*/
MRSAppKernel_IOPack.prototype.readJSONFile = function (filePath, cbSuccess, cbError) {
    'use strict';
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { // has finished?
            if (xhr.status === 200 || xhr.status === 0) { // has found?
                try {
					cbSuccess && cbSuccess(JSON.parse(xhr.responseText));
                } catch (e) {
					console.error('readJSONFile error', e);
                    cbError(-1);
                }
            } else {
                cbError(xhr.status);
            }
        }
    };
    xhr.send(null);
};

/**
@module window.tlantic
@submodule window.tlantic.io
@main window.tlantic
**/
window.tlantic.io = new MRSAppKernel_IOPack();
/**
 * Settings Kernel Pack
 * This kernel pack includes some auxiliary methods to help app settings management. 
 * @class MRSAppKernel_SettingsPack
 * @constructor
 * @since 0.7.0
 */
function MRSAppKernel_SettingsPack() {
	'use strict';
	
    this.buildKey = function(key) {
        return 'MRSAPPSETTINGS_' + key.toUpperCase().replace(/\./gi,'');
    };
	
	this.buildValue = function(value) {
		return {
			timestamp: (new Date()).toISOString(),
			data: value
		};
	};
}


/**
 * Load a setting from localstorage
 * 
 * @method get
 * @static
 * @param {string} key Setting key name
 * @return {string | object}
 */
MRSAppKernel_SettingsPack.prototype.get = function getSettings(key) {
	var result;
	
	// Check if key exists
	if (typeof key !== 'string')
		return undefined;
	
	// Get raw data from localstorage
	try {
		key = this.buildKey(key);
		result = window.localStorage.getItem(key);
	} catch(error) {
		console.error('MRS-APP-SETTINGS', 'get', error);
	}
	
	// Check if it exists
	if (result === undefined)
		return result;
	
	// Parse json and get only the data property
	try {
		result = JSON.parse(result);
		result = result.data;
	} catch(error) {
		console.log(result);
		console.error('MRS-APP-SETTINGS', 'get-parse', error);
	}
	
	return result;
};

/**
 * Set/save a value in localstorage
 * 
 * @method set
 * @static
 * @param {string} key Setting key name
 * @param {string | object} value Value to save, associated with key
 */
MRSAppKernel_SettingsPack.prototype.set = function setSettings(key, value) {
	
	// Check if key and value exists
	if (typeof key !== 'string' || !value)
		return undefined;
		
	// Build key and value
    try {
		key = this.buildKey(key);
		value = JSON.stringify(this.buildValue(value));
		
        window.localStorage.setItem(key, value);
    } catch(error) {
        console.error('MRS-APP-SETTINGS', 'set', error);
    }
	
	return value;
};



/**
@module window.tlantic
@submodule window.tlantic.settings
@main window.tlantic
**/
window.tlantic.settings = new MRSAppKernel_SettingsPack();
/**
The 'mrsAppCore' module is a set of tools and services made to provide a common infrastructure necessary
to build new rich web or mobile applications.

It is a global place for creating and registering Angular modules regarding the mentioned scope. All
modules (angular core or 3rd party) that should be available as part of this "foundation framework" for
Tlantic apps must be part of this.

@module MRS.App.Core
**/
angular.module('MRS.App.Core', []);

// Providers configuration
angular.module('MRS.App.Core').config(['$mrsappcoreConfig', '$provide', '$httpProvider', function (config, $provide, $httpProvider) {
    'use strict';
    var prov,
        defaultConfig = {
            log: {
                debug: true,
                saveToFile: false
            },
            authentication: {
                url: "http://auth.mrs.com/"
            },
            fileProxy: {
                path: ""
            },
            webHelper: {
                rules: []
            },
            websql: {
                database: {}
            }
        };

    // merge config with default
    angular.extend(config, defaultConfig, config);

    // adding $http interceptors
    $httpProvider.interceptors.push('authenticationInterceptor');
    $httpProvider.interceptors.push('webInterceptor');

    // registering file proxy
    prov = $provide.provider('fileProxy', FileProvider);       // fileProxy
    prov.filePath = config.fileProxy.path;

    // registering web helper
    prov = $provide.provider('webHelper', webHelperProvider);  // WebHelper
    prov.cacheRules = config.webHelper.rules;

    // registering websql proxy
    prov = $provide.provider('websqlProxy', webSqlProvider);   // websqlProxy
    prov.websqldb = config.websql.database;

    // decorating default log behavior
    $provide.decorator('$log', ['$delegate', 'logger', function ($delegate, logger) {
        return logger($delegate, config.log.debug);
    }]);
}]);

// services ramp up
angular.module('MRS.App.Core').run(['$mrsappcoreConfig', '$injector', function (config, $di) {
    'use strict';

    // starting authentication service
    $di.get('authentication').url = config.authentication.url;
}]);
/**
    The authenticationInterceptor intercepts all calls to the $http service and adds a sessionID header.

    @class authenticationInterceptor
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module('MRS.App.Core').factory('authenticationInterceptor', ['authentication', function (authentication) {
    'use strict';

    return {
        /**
            Parses the $http request options and adds the sessionID header, if present.

            @method request
            @param config {Object} $http request options
            @returns {Object} $http request options
        **/
        request: function (config) {

            var sessionID = authentication.getSessionID();

            if (sessionID && config.auth) {
                config.headers['X-Tlantic-SessionId'] = sessionID;
                delete config.auth;
            }

            return config;
        }
    };
}]);
angular.module('MRS.App.Core').service('authentication', ['$injector', '$log', function ($injector, $log) {
    'use strict';

    var self = this,

    /**
        MRS Server authentication sessionID.

        @private
        @property sessionID
        @type String
    **/
        sessionId;

    /**
        MRS Server authentication service url.

        @public
        @property url
        @type String
    **/
    self.url = '';

    /**
        Retrieves the current sessionId.

        @method getSessionID
        @public
    **/
    self.getSessionID = function () {
        return sessionId;
    };

    /**
        Set the current sessionId.

        @method setSessionID
        @public
        @param value {String} SessionId to be stored.
    **/
    self.setSessionID = function (value) {
        sessionId = value;
    };

    /**
        Validates user credentials against the authentication service located in the MRS Server.
        If valid, the webProxy server will be set with the token to be used in subsequent requests.

        @method authenticate
        @public
        @param onSuccess {Function} Request success callback.
        @param onError {Function} Request failure callback.
        @param username {String} Credential username.
        @param password {String} Credential password.
    **/
    self.authenticate = function (userId, password, clientTypeId, onSuccess, onError) {
        var promise,
            webProxy = $injector.get('webProxy'),
            request = {
                url: self.url,
                method: 'POST',
                data: {
                    userId: userId,
                    password: password,
                    clientTypeId: clientTypeId
                }
            };

        // sending request
        promise = webProxy.send(request);

        promise.then(function (result) {
            sessionId = result.data.SessionId;

            if (onSuccess) {
                onSuccess(result);
            }
        }, function (error) {
            $log.error('Authentication error.');

            if (onError) {
                onError(error);
            }
        });
    };
}]);
/**
    The Data Connector is an abstraction of all proxies to data access policies. Through this service 
    Business modules can request data without any concern about which is the right proxy to get the info.

    This service doesn't care about data format. Each Business Module should respect the information format
    based on their own requests.
    
    @class dataConnector
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module("MRS.App.Core").service("dataConnector", ["$injector", "$log", function mrsCoreDataConnector($di, $log) {
    'use strict';

/** 
    Identifies the data access policies flavours available at MRS.App.Core.
    @property policies
    @type {Object}
    @private
    @example
    
    Types of requests:
        - ONLINE_WITHCACHE: gets info from server respecting caching policies.
        - ONLINE_NOCACHE: gets live data from server ignoring any cache policy.
        - ONLINE: gets info from server caching only the result.
        - OFFLINE: gets info from offline database.
**/
    var policies = {
        "ONLINE_WITHCACHE": {proxy: "webProxy", cache: true},
        "ONLINE_NOCACHE": {proxy: "webProxy", cache: false},
        "ONLINE": {proxy: "webProxy", cache: false, forceHit: true},
        "OFFLINE": {proxy: "sqliteProxy"}
    };

    /**
        Returns data access policies definitions.
        
        @method getPolicies
        @returns {Object} Policies definitions.
    **/
    this.getPolicies = function dataConnectorGetPolicies() {
        return policies;
    };

    /**
        Fetch data from multiple data sources based on a given Data Access policy. THe request may be modified
        regarding the chosen policy, but the returned data is never modified.
        
        Each caller must handle the returned data.
        
        @method fetch
        @param request {Object} Request object definition
        @param policy {Object} Data access policy
        @returns {Object} Proxy promise
        
        @example
        
        // retrieving online policy
        var myrequest = {url: "http://localhost/myservice/", method: "POST"};
        var mypolicy  = connector.getPolicies().ONLINE;
        
        // getting data
        var result = connector.fetch(myrequest, mypolicy);
        
        // handling result
        result.then(successCallbackFunction, errorCallbackFunction);
    **/
    this.fetch = function dataConnectorFetch(request, policy) {
        var proxy;

        $log.debug("DataConnector.fetch()");
        $log.debug("Request: " + JSON.stringify(request));

        try {
            // getting proxy ref.
            $log.debug("Fetching data using proxy: " + policy.proxy);
            proxy = $di.get(policy.proxy);

            // adapting request
            $log.debug("Sending request...");
            request.cache = policy.cache;
            request.forceHit = policy.forceHit;

            // sending request            
            return proxy.send(request);
        } catch (err) {
            $log.error("PROBLEM EXECUTING PROXY " + policy.proxy + ": " + err.message);
        }
    };
}]);
/**

The EventPublisher is a hub for all application events fired along the application execution.
It is a powerful utility for debugging as application events are logged and can be analyzed
wheter they were fired or if they were fired in the proper order.

@class eventPublisher
@namespace MRS.App.Core
@since 0.1.0

**/
angular.module('MRS.App.Core').service('eventPublisher', ['$rootScope', '$log', function ($rootScope, $log) {
    "use strict";

    this.events = {
        /**
            Fired when a scheduler job crashes.

            @event JOB_CRASH
            @param jobName {String} the job who has failed
            @param exception {Object} exception details
        **/
        JOB_CRASH: "MRSAPPCORE_JOB_CRASH",


        /**
            Fired when an error is logged.

            @event UNEXPECTED_ERROR
            @param msg {String} Error message.
        **/
        UNEXPECTED_ERROR: "MRSAPPCORE_UNEXPECTED_ERROR"
    };

    /**
    Publish an event so subscribers in different components can deal with the message.

    @method publish
    @param eventName {String|Object} name of the event or object (eventPublisher.events) to be published.
    @param args* {Object} list of arguments to pass along with the message.
    **/
    this.publish = function (eventName, args) {
        $log.debug('EVENT PUBLISHED: ' + eventName + ' - ' + args);
        $rootScope.$broadcast.apply($rootScope, arguments);
    };
}]);
/**
The $exceptionHandler service is a MRS Core handler for intercepting application exceptions.
This service is purposely named with the same name as the Angular's exception handler service (ng.$exceptionHandler)
which allows the default service behaviour to be extended.

Custom behaviour was added, handing the exception and cause to the MRS Logger service and, subsequently,
firing a specific application error event so other modules can deal the error properly.

@class $exceptionHandler
@namespace MRS.App.Core
@since 0.1.0
**/
angular.module('MRS.App.Core').factory('$exceptionHandler', ['$injector', function ($injector) {
    'use strict';
    return function (exception, cause) {
        $injector.get("$log").error(exception, cause);
    };
}]);
/**
    Provide access to file ready/writer through Phonegap 2.9.0 API. 
    
    @class fileProvider
    @namespace MRS.App.Core
    @constructor
    @since 0.1.0
**/
function FileProvider() {
    'use strict';
    /**
    Path for file access. For security reasons, this service/provider has access only to this folder. Any file must be placed at
    this folder and this attribute can be accessed only during config time.
    
    @attribute filePath
    @type String
    **/
    this.filePath = "";

    /**
    Returns a service instance to provide read/write operations to files using Phonegap API
    
    @method $get
    @returns {Object} Provider runtime instance
    **/
    this.$get = function fileProviderGet() {
        var path   = this.filePath,
            buffer,
            file;

        return {
            /**
                Returns true if Phonegap API Plugin is present/enabled in the app context. Otherwise, returns false.

                @method isPluginEnabled
                @returns {Boolean} true if plugin is enabled
            **/
            isPluginEnabled: function fileProviderIsPluginEnabled() {
                var result = (
                    window.requestFileSystem !== undefined &&
                    window.requestFileSystem !== null &&
                    (window.cordova !== undefined || window.phonegap !== undefined)
                );
                return result;
            },

            /**
                Log into console when any internal IO failure happens.
                
                @method onIOFailure
                @param {Object} error exception details.
            **/
            onIOFailure: function fileProviderOnIOFailure(error) {
                throw 'INTERNAL IO FAILURE: ' + error;
            },

            /**
                Use fileWriter object to write data into a file.
                
                @method onGotFW
                @param {Object} Phonegap FileWriter object
            **/
            onGotFW: function fileProviderOnGotFW(writer) {
                // fast forwards file pointer to end of file
                writer.seek(writer.length);

                // writing data
                writer.write(buffer);
            },

            /**
                Use fileEntry object to create a FileWriter instance.
                
                @method onGotFE
                @param {Object} Phonegap fileEntry object
            **/
            onGotFE: function fileProviderOnGotFE(fileEntry) {
                fileEntry.createWriter(this.onGotFW, this.onIOFailure);
            },

            /**
                Use filesystem object to retrieve file entry object. It is triggered by writeLine method.
                
                @method onGotFS
                @param {Object} Phonegap fileSystem object
            **/
            onGotFS: function fileProviderOnGotFS(fileSystem) {
                fileSystem.root.getFile(file, {create: true, exclusive: false}, this.onGotFE, this.onIOFailure);
            },

            /**
                Append a new line into a file. IF the file doesn't exist, create a new one.
                
                @method writeLine
                @param {String} fileName name of file
                @param {String} data information to be persisted
                @param {Callback} Callback for error
            **/
            writeLine: function fileProviderAppend(fileName, data, cbError) {
                // getting entire path
                file = path + fileName;

                // buffering information
                buffer = "\n" + data;

                // requesting file system
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.onGotFS, cbError);
            }
        };
    };
}
/**
The logger service is a service in charge for logging all received messages, especially for debugging purposes.

By default, it is set to log all entries into the browser console (very helpful during project development).

@class logger
@namespace MRS.App.Core
@since 0.1.0
**/
angular.module('MRS.App.Core').factory('logger', ['$injector', function mrsCoreLogger($injector) {
    "use strict";

    /**
        @class logger
        @constructor
        @param $delegate {Object} base $log implementation
        @param debugEnabled {Boolean} switch on/off flag for debug
    **/
    return function loggerFactory($delegate, debugEnabled) {
        return {
            /**
                Switch on/off debugging capability for log behavior.
                
                @property isDebug
                @type Boolean
            **/
            isDebug: debugEnabled || false,

            /**
                Process log information using $delegate(original $log) and persisting 
                information when working in debug mode or it is an error.
                
                @param type {String} Message type: debug|log|info|warn|error
                @param msg {String} Message to be processed
                @param details {Object} <optional>: detailed debug information
            **/
            process: function loggerProcess(type, msg, details) {
                // building log prefix
                var prefix = "[" + type.toUpperCase() + "]::[" + new Date() + "] - ";

                // delegating to original $log / checking method called
                if ($delegate[type.toLowerCase()]) {
                    $delegate[type.toLowerCase()](prefix + msg);
                } else {
                    $delegate.log(prefix + msg);
                }

                // checking 
                if (this.isDebug) {

                    // logging debug details
                    if (details !== undefined) {

                        // validating debug
                        if ($delegate.debug) {
                            $delegate.debug(details);
                        } else {
                            $delegate.log(details);
                        }
                    }
                }
            },

            /**
                Saves messages and classifies it as a debug message.
                @method debug
                @param {String} msg Data to be logged.
            **/
            debug: function loggerDebug(msg) {
                this.process("debug", msg);
            },

            /**
                Saves messages and classifies it as a log message.
        
                @method log
                @param {String} msg Data to be logged.
                **/
            log: function loggerLog(msg) {
                this.process("log", msg);
            },

            /**
                Saves messages and classifies it as an warning message.
        
                @method warn
                @param {String} msg Data to be logged.
                **/
            warn: function loggerWarn(msg) {
                this.process("warn", msg);
            },

            /**
                Saves messages and classifies it as an info message.
        
                @method info
                @param {String} msg Data to be logged.
                **/
            info: function loggerInfo(msg) {
                this.process("info", msg);
            },

            /**
                Saves messages and classifies it as an error message.
        
                @method error
                @param {string|exception} Error object or string message
            **/
            error: function loggerError(exception) {
                var $bus = $injector.get("eventPublisher"),
                    msg,
                    details;

                if (typeof exception === "string") {
                    msg = exception;

                } else if (typeof exception === "object" && exception.message !== undefined) {
                    msg = exception.message;
                    details = exception;

                } else {
                    msg = JSON.stringify(exception);
                }

                this.process("error", msg, details);
                $bus.publish($bus.events.UNEXPECTED_ERROR, msg, details);
            }
        };
    };
}]);
/**
    Provide access to HTML5 browser's sessionstorage. This is a concurrency safe implementation. Once JS is a turn-based script you won't face issues
    except if you try to used through webworkers. That was not tested.

    @class sessionProxy
    @namespace MRS.App.Core
    @since 0.4.0
**/
angular.module('MRS.App.Core').service('sessionProxy', ['$window', '$q', function ($window) {
    "use strict";

    var self = this;

    /**
        Check if a data is a valid JSON object or not.

        @method isJSON
        @param {Object} data data to be parsed
    **/
    this.isJSON = function (data) {
        var isJson = true;

        if (typeof data !== "object") {
            try {
                JSON.parse(data);
            } catch (e) {
                isJson = false;
            }
        }
        return isJson;
    };

    /**
        Pack a data to string object (which is the sessionStorage format. In case of a String object, the object remains the same.
        Otherwise, check if data is a JSON to be stringified or an object to return ".toString()" result.

        @method pack
        @param {String|JSON|Object} data to be packed.
        @returns {String} stringified data
**/
    this.pack = function (data) {
        return (angular.isString(data) ? data : (self.isJSON(data) ? JSON.stringify(data) : data.toString()));
    };

    /**
        Unpack a data to JSON (when can be parsed) returnning a string otherwise.

        @method unpack
        @param {String} data to be parsed
        @returns {String|JSON} parsed data
    **/
    this.unpack = function (data) {
        return (self.isJSON(data) ? JSON.parse(data) : data);
    };

    /**
    Sets a value in the browser's sessionStorage associated with a given key in the current application's context.

    @method put
    @param key {String} Unique value in which data will be associated to.
    @param value {String|JSON} Data to be stored.
    **/
    this.put = function (key, value) {
        if (key) {
            $window.sessionStorage.setItem(key.toString().toLowerCase(), self.pack(value));
        }
    };

    /**
    Gets the data stored in the browser's sessionStorage associated with the given key in the current application's context.

    @method get
    @param key {String} Unique value in which data will be associated to.
    @return {String|JSON} Data stored in the localstorage. Returns null if the key is invalid or data is not found. 
    **/
    this.get = function (key) {
        var value = null;

        if (key) {
            value = $window.sessionStorage.getItem(key.toString().toLowerCase());
        }

        if (!value) {
            return null;
        }

        return self.unpack(value);
    };



    /**
    Gets all available data stored in the browser's sessionStorage in the current application's context.

    @method dump
    @return {Array} List of values stored in the sessioStorage
    **/
    this.dump = function () {
        var values = [], i, key, value;

        for (i = 0; i < $window.sessionStorage.length; i += 1) {
            key = $window.sessionStorage.key(i);
            value = self.get(key);

            values.push(value);
        }

        return values;
    };


    /**
    Removes an entry in the browser's sessionStorage associated with a given key in the current application's context.

    @method remove
    @param key {Object} Unique value in which data will be associated to.
    **/
    this.remove = function (key) {
        if (key) {
            $window.sessionStorage.removeItem(key.toString().toLowerCase());
        }
    };

    /**
    Removes all entries in the browser's sessionStorage in the current application's context.

    @method clear
    @param key {Object} Unique value in which data will be associated to.
    **/
    this.clear = function () {
        $window.sessionStorage.clear();
    };
}]);
/**
    Provide access to SQLite Database. This is not a 100% concurrency safe implementation. Once JS is a turn-based script you won't face issues except
    if you try to used through webworkers. That was not tested.

    @class sqliteProxy
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module("MRS.App.Core").service("sqliteProxy", ["$window", "$q", "$cacheFactory", function ($window, $q, $cacheFactory) {
    "use strict";

    var self = this,
        /**
        Promise object for query execution.

        @private
        @property execHandler
        @type Object
    **/
        execHandler;

    /**
        Cached memory objects containing all opened connections for SQLite databases stored
        in device disk.

        @property connections
        @type Object
    **/
    this.rawConnections = $cacheFactory("APP_SQL_DBS");

    /**
        Default callback for transaction errors. Rejects the execution promise, forcing caller error callback.
        Pass to promise error callback the error message.

        @param {Object} exception
    **/
    this.onTransactionError = function (err) {
        execHandler.reject(err.message);
    };

    /**
        Default callback for transaction success. Resolve the execution promise, forcing caller success callback.
        Pass to promise success callback the "rows" returned by SQLite Phonegap Plugin.
    **/
    this.onTransactionSuccess = function (tx, res) {
        /*jslint unparam:true*/
        execHandler.resolve(res);
    };

    /**
        Execute a given query using the connection object, returning the query result.

        @param {Object} database connection
        @param {String} sqlite query
        @param {Array}  query parameters
        @returns {Object} query result (rows)
    **/
    this.execute = function (connection, query, params) {
        execHandler = $q.defer();

        connection.transaction(function (tx) {
            tx.executeSql(query, params, self.onTransactionSuccess, self.onTransactionError);
        });

        return execHandler.promise;
    };

    /**
        Checks if there is a connection for database <dbname>. If doesn't, it opens one. In both cases, returns an active connection for the caller.

        @method open
        @param {String} dbname
        @returns {Object} active connection
    **/
    this.open = function (dbname) {

        // formatting data
        // looking for opened connection
        var database = dbname.toLowerCase(),
            conn = self.rawConnections.get(database);

        // if not found open and save it
        if (conn === null || conn === undefined) {
            conn = $window.sqlitePlugin.openDatabase({ name: database });
            self.rawConnections.put(database, conn);
        }
        return conn;
    };

    /**
    Send request to be executed by proxy data source. The snippet of this page contains the example of a well formed request for
    SQLite requests. Before that, check if there is a opened connection and if not, does it.

    @method send
    @param {Object} request
    @example

    var request = {
        dbname: "mydb",
        query : "SELECT * FROM USER",
        params: []
    };

    var promise = proxy.send(request);

    promise.then(
                function(data){
                    // success callback
                },

                function(err){
                    // error callback
                }
    );
    **/
    this.send = function (request) {
        var conn = this.open(request.dbname);
        return this.execute(conn, request.query, request.params);
    };
}]);
/**
    Provide access to HTML5 browser's localstorage. This is a concurrency safe implementation. Once JS is a turn-based script you won't face issues                               
    except if you try to used through webworkers. That was not tested.

    @class storageProxy
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module('MRS.App.Core').service('storageProxy', ['$window', '$q', function mrsCoreStorageProxy($window) {
    "use strict";

    var self = this;

    /**
        Check if a data is a valid JSON object or not.
        
        @method isJSON
        @param {Object} data data to be parsed
    **/
    this.isJSON = function sessionProxyIsJSON(data) {
        var isJson = true;

        if (typeof data !== "object") {
            try {
                JSON.parse(data);
            } catch (e) {
                isJson = false;
            }
        }
        return isJson;
    };

    /**
        Pack a data to string object (which is the localStorage format. IN case of a String object, the object remains the same. 
        Otherwise, check if data is a JSON to be stringified or an object to return ".toString()" result.
        
        @method pack
        @param {String|JSON|Object} data to be packed.
        @returns {String} stringified data
    **/
    this.pack = function storageProxyPack(data) {
        return (angular.isString(data) ? data : (self.isJSON(data) ? JSON.stringify(data) : data.toString()));
    };

    /**
        Unpack a data to JSON (when can be parsed) returnning a string otherwise.
        
        @method unpack
        @param {String} data to be parsed
        @returns {String|JSON} parsed data
    **/
    this.unpack = function storageProxyUnpack(data) {
        return (self.isJSON(data) ? JSON.parse(data) : data);
    };

    /**
    Sets a value in the browser's localstorage associated with a given key in the current application's context.
    
    @method put
    @param key {String} Unique value in which data will be associated to.
    @param value {String|JSON} Data to be stored.
    **/
    this.put = function storageProxyPut(key, value) {
        if (key) {
            $window.localStorage.setItem(key.toString().toLowerCase(), self.pack(value));
        }
    };

    /**
    Gets the data stored in the browser's localstorage associated with the given key in the current application's context.
    
    @method get
    @param key {String} Unique value in which data will be associated to.
    @return {String|JSON} Data stored in the localstorage. Returns null if the key is invalid or data is not found. 
    **/
    this.get = function storageProxyGet(key) {
        var value = null;

        if (key) {
            value = $window.localStorage.getItem(key.toString().toLowerCase());
        }

        if (!value) {
            return null;
        }

        return self.unpack(value);
    };

    /**
    Gets all available data stored in the browser's localstorage in the current application's context.
    
    @method dump
    @return {Array} List of values stored in the localstorage
    **/
    this.dump = function storageProxyDump() {
        var values = [], i, key, value;

        for (i = 0; i < $window.localStorage.length; i += 1) {
            key = $window.localStorage.key(i);
            value = self.get(key);

            values.push(value);
        }

        return values;
    };


    /**
    Removes an entry in the browser's localstorage associated with a given key in the current application's context.
    
    @method remove
    @param key {Object} Unique value in which data will be associated to.
    **/
    this.remove = function storageProxyRemove(key) {
        if (key) {
            $window.localStorage.removeItem(key.toString().toLowerCase());
        }
    };

    /**
    Removes all entries in the browser's localstorage in the current application's context.
    
    @method clear
    @param key {Object} Unique value in which data will be associated to.
    **/
    this.clear = function storageProxyClear() {
        $window.localStorage.clear();
    };
}]);
/**
    Webcache is a cache mechanism made to enhance webproxy experience providing async requests and offline capabilities
    for recent requests results, preventing several hits at server.
    
    @class webCache
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module("MRS.App.Core").service("webCache", ["webHelper", "storageProxy", "$cacheFactory", "$q", "$timeout", function mrsCoreWebCache(helper, storage, $cacheFactory, $q, $timeout) {
    'use strict';
    var self = this,

        /**
         Cache for promises made, supporting async requests.
            
         @attribute requestCache
         @type Object
         @private
        **/
        requestCache = $cacheFactory("WEB_REQ_CACHE");

    /**
        Builds a key for be used by cache based on $http options.

        @method buildKey
        @param options {Object} $http request options
        @returns {String} Key to be used for caching
    **/
    self.buildKey = function webCacheBuildKey(options) {
        var token = options.method + options.url + (options.data === undefined ? "" : storage.pack(options.data));
        return token;
    };

    /**
        Returns cached value based on request options, filtering regarding cacheRules (webHelper) configuration.
        In case there is no cached value or it is dirty, null is returned.
        
        @method get
        @param options {Object} $http request options
        @param timestamp {Number} An optional timestamp number in milisseconds to consider cache dirty.
        @returns {Object} filtered cached value (null if not found)
    **/
    self.get = function webCacheGet(options, timestamp) {
        // get storage key or cache key if not exists
        var value, key = options.storageKey || options.cacheKey;

        value = storage.get(key);

        return helper.filter(key, value, timestamp);
    };

    /**
        Create a promise and cache it in order to provide async/parallel support.
        
        @method defer
        @param options {Object} $http request options
        @param saving {Boolean} True if this request wil work with cache.
        @returns {Object} request promise.
    **/
    self.defer = function webCacheDefer(options, saving) {

        // creating promise
        var key = options.cacheKey,
            handler = $q.defer();

        // persisting promise
        requestCache.put(key, {handler: handler, isSaving: saving});

        // returning
        return handler.promise;
    };

    /**
        Cache request success data based on cached request configurations(saving).
        
        @method saveWhenNeeded
        @param data {Object} Data returned by $http success callback.
        @param options {Object} Original request information.
        @returns {Boolean} True if data was saved, false otherwise.
    **/
    self.saveWhenNeeded = function webCacheSaveWhenNeeded(data, options) {
        var value,
            cacheKey = options.cacheKey,
            storageKey = options.storageKey || options.cacheKey,
            result = false;

        value = requestCache.get(cacheKey);

        // if must save, do it!
        if (value.isSaving) {
            data.CACHE_TIMESTAMP = new Date().getTime();
            storage.put(storageKey, data);
            result = true;
        }

        return result;
    };

    /**
        Finishes a promise bases on a cached request.
        
        @method finishPromise
        @param action {Boolean} True if promise must be resolved, false to reject it.
        @param data {Object} $http data (returned by callback)
        @param status {Number} $http  status ( returned by callback)
        @param headers {Function} $http headers ( returned by callback)
        @param config {Object} $http original request ( returned by callback)
    **/
    self.finishPromise = function webCacheFinishPromise(action, data, status, headers, config) {
        var value,
            result = helper.formatResponse(data, status, headers, config),
            key = config.cacheKey;

        // resolving/rejecting promise
        value = requestCache.get(key);

        if (action) {
            value.handler.resolve(result);
        } else {
            value.handler.reject(result);
        }

        // cleaning cache
        requestCache.remove(key);
    };

    /**
        Resolves a promise through finishPromise method.
        
        @method resolve
        @param data {Object} $http data (returned by callback)
        @param status {Number} $http  status ( returned by callback)
        @param headers {Function} $http headers ( returned by callback)
        @param config {Object} $http original request ( returned by callback)        
    **/
    self.resolve = function webCacheResolve(data, status, headers, config) {
        self.finishPromise(true, data, status, headers, config);
    };

    /**
        Rejects a promise through finishPromise method.
        
        @method reject
        @param data {Object} $http data (returned by callback)
        @param status {Number} $http  status ( returned by callback)
        @param headers {Function} $http headers ( returned by callback)
        @param config {Object} $http original request ( returned by callback)        
    **/
    self.reject = function webCacheReject(data, status, headers, config) {
        self.finishPromise(false, data, status, headers, config);
    };

    /**
        Resolves asynchronously the resolution of a promise in  order to keep the compatibility 
        of cached values once storageProxy is not async.
        
        @method resolveAsync
        @param options {Object} $http request options
    **/
    self.resolveAsync = function webCacheResolveAsync(options) {
        // IMPORTANT: need $timeout in order to guarantee the promise returning before it is resolve.
        $timeout(function resolveAsyncCallback() {
            var data = self.get(options);
            //delete data.CACHE_TIMESTAMP;
            self.resolve(data, 304, function () { return undefined; }, options);
        });
    };
}]);
function webHelperProvider() {
    'use strict';
    /*jshint validthis:true */

    /**
        Provides in "config-time" the configuration of services endpoints and the timeout to consider their results as "dirty" for
        cache system. This work similar to ipTables, so, in other words, once there is a match, the mechanism is interrupted and
        the the data is considered dirty (or not). To avoid issues matching cached values with the wrong rule, you need to
        "declare" (add) the restrictive rules first nad think about letting the general ones to the end.

        @property cacheRules
        @type {Array}
        @example

        <!--
         *
         * A well-formed rule has the followind attributes:
         * {
         *      service: "string containing endpoint address",
         *      timeout: 1 // life time for service call result (in milliseconds)
         * }
         -->
        helper.push({service: "http://my-endpoint/service/1", timeout: 1000});
        helper.push({service: "http://my-endpoint/service/2", timeout: 2000});
        helper.push({service: "http://my-endpoint/service", timeout: 3});

    **/
    this.cacheRules = [];

    /**
    Returns a service instance to provide support functions to WebProxy stack.

    @method $get
    @returns {Object} Provider runtime instance
    **/
    this.$get = function () {

        var filters = this.cacheRules;

        return {
            /**
                Filters cached value based on WebHelper filtering rules or informed timestamp. Returns NULL if there is
                no valid cached value or cached value itself, otherwise.

                @method filter
                @param key {String} Cache key value
                @param value {Object} Cached value object
                @param timestamp {Number} An optional timeout in milisseoconds to force dirty check value.
                @returns {Object} NULL if cached value is not valid, Object otherwise.
            **/
            filter : function (key, value, timestamp) {
                var idx,
                    rule,
                    size = filters.length,
                    now = new Date().getTime();

                // checking value
                if (value === undefined || value === null) {
                    return null;
                }

                //validating if value is really a cached data
                if (value.CACHE_TIMESTAMP === undefined) {
                    return value;
                }

                // forcing cache dirty check
                if (timestamp !== undefined) {
                    if (now - value.CACHE_TIMESTAMP > timestamp) {
                        return null;
                    }
                    return value;

                    // filtering data
                }

                // checking cache rules
                for (idx = 0; idx < size; idx += 1) {

                    // retrieving filter
                    rule = filters[idx];

                    // if matches...
                    if (key.indexOf(rule.service.toLowerCase()) === 0) {

                        // check timestamp
                        if (now - value.CACHE_TIMESTAMP > rule.timeout) {
                            return null;
                        }
                        break;
                    }
                }


                // by default, return the value
                return value;
            },

            /**
                Formats a response object based on $http request default result objects.

                @method formatResponse
                @param data {Object} $http result data
                @param status {Number} $http status code
                @param headers {Function} headers accessor function
                @param config {Object} $http original request
                @returns {Object} Well-formated response object
            **/
            formatResponse : function (data, status, headers, config) {

                // embedding result
                var response = {
                    data: data,
                    status: status,
                    headers: headers || function () { return undefined; },
                    config: config || {}
                };

                return response;
            }
        };

    };
}
/**
    The webInterceptor analyzes all http responses and log exceptions.

    @class webInterceptor
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module('MRS.App.Core').factory('webInterceptor', ['$log', '$q', function ($log, $q) {
    'use strict';

    return {
        /**
            Parses the $http response and analyzes if the user has access permission to the requested url.

            @method response
            @param response {Object} $http response object
            @returns {Object} $http response object
        **/
        response: function (response) {

            // application error
            if (response.status === 206) {
                return $q.reject(response);
            }

            return response;
        },

        responseError: function (response) {

            // application error
            if (response.status === 0) {
                response.status = 404;
            }
            // bad request
            $log.error(JSON.stringify(response));

            return $q.reject(response);
        }

    };
}]);
/**
    The WebProxy is a proxy that facilitates communication with HTTP servers.

    @class webProxy
    @namespace MRS.App.Core
    @since 0.1.0
**/
angular.module('MRS.App.Core').service('webProxy', ['$http', '$q', 'webCache', function ($http, $q, webCache) {
    "use strict";

    var self = this,
        httpGroups = [];

    /**
        Request failure callback.

        @method onRequestError
        @param data {Object} Error information.
        @param status {Number} HTTP status code of the response.
        @param headers {Function} Header getter function.
        @param config {Object} The configuration object that was used to generate the request.
    **/
    self.onRequestError = function (data, status, headers, config) {
        webCache.reject(data, status, headers, config);
    };

    /**
        Request success callback.

        @method onRequestSuccess
        @param data {Object} Returned data.
        @param status {Number} HTTP status code of the response.
        @param headers {Function} Header getter function.
        @param config {Object} The configuration object that was used to generate the request.
    **/
    self.onRequestSuccess = function (data, status, headers, config) {
        // if data is empty, it will fail when cache is enabled
        data = data || {};

        // saving in cache
        webCache.saveWhenNeeded(data, config);

        // return value
        webCache.resolve(data, status, headers, config);
    };

    /**
        Hit server sending the request given the following options.

        @method hit

        @param options {Object} Options following AngularJS $http format.
        @param forceCache {Boolean} True if it should work with cache (reading)
        @param forceHit {Boolean} True if it should force a hit against server
        @param timestamp {Number} An optional timestamp number in milisseconds to consider cache dirty.
    **/
    self.hit = function (options, forceCache, forceHit, timestamp) {
        var saving =  forceCache || forceHit,
            mustHitServer = (!forceCache ? true : (webCache.get(options, timestamp) === null)),
            salt = (new Date()).getTime().toString() + Math.random().toString(),
            promiseExists = false,
            cancelPromiseName,
            defer,
            i;

        if (!options.timeout) {
            if (!options.groupName) {
                cancelPromiseName = 'default';
            } else {
                cancelPromiseName = options.groupName;
            }
        }

        if (cancelPromiseName) {
            for (i = 0; i < httpGroups.length; i += 1) {
                if (httpGroups[i].name === cancelPromiseName) {
                    promiseExists = true;
                    defer = httpGroups[i].defer;
                    break;
                }
            }

            if (!promiseExists) {
                defer = $q.defer();

                httpGroups.push({ name: cancelPromiseName, defer: defer });
            }

            options.timeout = defer.promise;
        }

        // single point of cache key creation used to associate request promises
        options.storageKey = webCache.buildKey(options);

        // save salt for cache usage
        options.cacheKey = options.storageKey + salt;

        // if must hit the server, call $http. Case else, return the cached value "async"
        if (mustHitServer) {
            $http(options).success(self.onRequestSuccess).error(self.onRequestError);
        } else {
            webCache.resolveAsync(options);
        }

        // returning promise
        return webCache.defer(options, saving);
    };

    /**
        Cancel http requests.

        @method cancelRequest

        @param groups {Array} List of group names the requests belong to.
    **/
    self.cancelRequest = function (groups) {

        var isArray = Array.isArray(groups),
            i,
            g;

        if (!isArray || (isArray && groups.length === 0)) {
            groups = ['default'];
        }

        for (i = httpGroups.length - 1; i >= 0; i -= 1) {
            for (g = 0; g < groups.length; g += 1) {
                if (httpGroups[i].name === groups[g]) {
                    httpGroups[i].defer.resolve('cancelled');
                    httpGroups.splice(i, 1);
                }
            }
        }
    };

    /**
        Send method works as an "interface" for MRS.App.Core Data Connector. Basically, it receives a request and converts to a
        $http request option format.

        @method send
        @param request {Object} Data Connector request.
        @return {Object} Promise object

        @example

        This is an example of a well-formed webProxy request:

        {
            url: "<service url>",
            method: "POST|GET",
            cache: true|false,           // <optional> : this is defined by data connector
            auth: true|false,            // <optional> : if need to work with auth session header
            forceHit: true|false         // <optional> : force a hit against server and cache results
            data: ????                   // <optional> : information to be posted
            timeout: ???                 // <optional> : timeout in milisseconds for request abortion
            timestamp: ???               // <optional> : timestamp in milisseconds for cache dirty check

        }
    **/
    self.send = function (request) {

        // defining force flags
        var forceCache = (request.cache === undefined ? false : request.cache),
            forceHit = (request.forceHit === undefined ? false : request.forceHit),

            // defining $http options
            options = {
                url: request.url,
                method: request.method.toUpperCase(),
                cache: false
            };

        // handling data
        if (request.data !== undefined) {
            options.data = request.data;
        }

        // handling authorization flag
        if (request.auth) {
            options.auth = true;
        }

        // handling timeout
        if (request.timeout !== undefined) {
            options.timeout = request.timeout;
        }
        // handling group name
        if (request.groupName !== undefined) {
            options.groupName = request.groupName;
        }

        return self.hit(options, forceCache, forceHit, request.timestamp);
    };

}]);

/**
    Provide configuration capabilities to WebSqlProxy in config time. Besides that, manages the db connection.

    @class websqlProvider
    @namespace MRS.App.Core
    @constructor
    @since 0.1.0
**/
function webSqlProvider() {
    'use strict';

    /*jshint validthis:true */
    var self = this;

    /**
    WebSQL database configuration information. The attribute access is allowed only during config time.

    @attribute websqldb
    @type Object
    @example

        var wsqlProvider = $provide.provider("websqlProvider", WebSqlProvider);
        wsqlProvider.websqldb = {dbname: "mrscore", version: "0.1", description: "MRS Core database", size: 5242880};
    **/

    this.websqldb = {};

    /**
    Synchronize local Websql database state executing schema queries.

    @method sync
    **/
    this.sync = function (schema) {
        var wdb = window.openDatabase(self.websqldb.dbname, self.websqldb.version, self.websqldb.description, self.websqldb.size);
        wdb.transaction(function (transaction) {
            angular.forEach(schema, function (query) {
                transaction.executeSql(query);
            });
        });
    };

    /**
    Returns an instance to provide connection management capability in runtime. There is no need to call this method. AngularJS
    does that automatically when during runtime injection by $provide.

    @method $get
    @returns {Object} provider runtime instance
    **/
    this.$get = function () {
        /**
            A mirror to provide accees to websqldb settings in runtime.
            
            @property config
            @private
        **/
        var config = this.websqldb;

        return {
            /**
            Stores a live connection with WebSql database.

            @attribute db
            @type Object
            **/
            db: undefined,

            /**
            Open a connection with Websql based on provider configurations, returning an object representing a live connection.
            
            @method open
            @returns {Object} database connection
            **/
            open: function websqlProviderOpen() {
                if (this.db === undefined) {
                    this.db =  window.openDatabase(config.dbname, config.version, config.description, config.size);

                    if (this.db === undefined) {
                        throw "UNABLE TO OPEN WEBSQL DATABASE: " + JSON.stringify(config);
                    }
                }
                return this.db;
            }
        };
    };
}