# MRS App Settings

This module, MRS App Settings module, is intended to provide settings update from remote sources.
It's designed to work with MRS.App.Core and Tlantic Kernel. 

## How to compile
Execute this command in the command line:
```
$ npm install
```
You're done! Simple, eh?

## How to develop
Compile is very simple. Just execute in command line:
```
$ grunt
```
Your code will be tested, compiled and minified into *dist* folder

## How to install
1. Include in your code (js or min.js) in index.html (included in *dist* folder)
```JavaScript
<script type="text/javascript" src="mrs-app-settings.min.js"></script>
```
2. Include angular dependency in your module declaration
```JavaScript
angular.module("MyApp", ["MRS.App.Core", "MRS.App.Settings"]);
```
3. Configure your configuration file (see *config/module.conf.json*)
```JavaScript
angular.module("MRS.App.Settings").constant("$mrsappsettingsConfig", {
	
});
```


## How to use
This module is available by service.


### API

#### MRSAppSettings
```JavaScript
angular.module("MyApp").controller("MyController", function(MRSAppSettings) {
    // your code here
});
```

##### check([modules]);
This method checks for an update for a set of modules.

It uses default modules in module settings if none is provided.

Params:
- modules: a list of modules (strings) ```["module-A", "module-B", ...]```

##### Example
```JavaScript
MRSAppSettings.check(); // will fetch server with default values
MRSAppSettings.check(["my-module"]); // will fetch server with "my-module"
``` 

##### Request to server
A list of modules is sent in the data container, with *settings* property.
```
data: {
    settings: ["module-A", "module-B", ...]
}
```

##### Response from server
The module expects to receive a list of modules settings objects.

All module object must have a *module* property.

```
result: [
    {"module": "module-A", ...},
    {"module": "module-B", ...}
]
```