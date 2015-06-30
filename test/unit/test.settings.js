describe('MRS.Settings:', function () {
    'use strict';
    
    describe('settings service:', function() {
       
       var settingsService, window, httpService, httpBackendService, log,
            validResponse, tlanticSettingsSetSpy;
       
       beforeEach(module('MRS.App.Settings'));
        
       beforeEach(inject(function (MRSAppSettings, $window, $http, $httpBackend, $log) {
           settingsService = MRSAppSettings;
           httpService = $http;
           httpBackendService = $httpBackend;
           window = $window;
           log = $log;
           
           validResponse = [{
               module: 'module1',
               data: 'OK1'
           },{
               module: 'module2',
               data: 'OK2'
           }];
           
           tlanticSettingsSetSpy = spyOn(window.tlantic.settings, 'set');
       }));
       
       afterEach(function () {
           httpBackendService.verifyNoOutstandingRequest();
           //httpBackendService.verifyNoOutstandingExpectation();
        });
        
        it('should have a check method', function() {
            expect(settingsService.check).toBeDefined();
        });
        
        it('should fetch server with default modules', function(done) {
            httpBackendService.expectPOST('/fake-module-path', {settings:['module1','module2']}).respond(200, {status: 'OK', result: validResponse});
            
            var onSuccess = function(result) {
                expect(result).toBe(true);
                expect(window.tlantic.settings.set).toHaveBeenCalled();
            };
            
            var onError = function(error) {
                console.log(error);
            };
            
            settingsService.check().then(onSuccess).catch(onError).finally(done);
            
            httpBackendService.flush();
        });
        
        it('should fetch server with given modules for update', function(done) {
            httpBackendService.expectPOST('/fake-module-path', {settings:['m1','m2']}).respond(200, {status: 'OK', result: validResponse});
            
            var onSuccess = function(result) {
                expect(result).toBe(true);
                expect(window.tlantic.settings.set).toHaveBeenCalled();
            };
            
            var onError = function(error) {
                expect(error).toBeUndefined();
            };
            
            settingsService.check(['m1','m2']).then(onSuccess).catch(onError).finally(done);
            
            httpBackendService.flush();
        });
        
        it('should show a warning message when window.tlantic is not available', function(done) {
            spyOn(log, 'error');
            tlanticSettingsSetSpy.and.throwError();
            
            httpBackendService.expectPOST('/fake-module-path', {settings:['m1','m2']}).respond(200, {status: 'OK', result: validResponse});
            
            var onSuccess = function(result) {
                expect(result).toBe(true);
                expect(window.tlantic.settings.set).toHaveBeenCalled();
                expect(log.error).toHaveBeenCalled();
            };
            
            var onError = function(error) {
                expect(error).toBeUndefined();
            };
            
            settingsService.check(['m1','m2']).then(onSuccess).catch(onError).finally(done);
            
            httpBackendService.flush(); 
        });
        
    });
    
    describe('settings adapter: ', function() {
        
        var settingsAdapter;
        
        beforeEach(module('MRS.App.Settings'));
        
        beforeEach(inject(function (MRSAppSettingsAdapter) {
            settingsAdapter = MRSAppSettingsAdapter;
        }));
        
        it('should have a check method', function() {
            expect(settingsAdapter.check).toBeDefined();
        });
        
        describe('check:', function() {

            it('should have a to method', function() {
                expect(settingsAdapter.check.to).toBeDefined();
            });
            
            it('should have a from method', function() {
                expect(settingsAdapter.check.from).toBeDefined();
            });
            
            it('to result must be valid', function() {
                var request = settingsAdapter.check.to(['my module']);
                
                expect(request).toEqual({
                    method: 'POST',
                    url: '/fake-module-path',
                    cache: true,
                    timestamp: 600000,
                    data: {
                        settings: ['my module']
                    }
                });
            });
            
            it('from result must be valid', function() {
                var fakeResult = {
                    module: "MRS.App.Settings",
                    version: 2  
                };
                var result = settingsAdapter.check.from({data: {status: "OK", result: fakeResult}});
                
                expect(result).toEqual(fakeResult);
            });
            
            
        });
        
        
    });
});