/*
 *    (c) Copyright 2018, F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  'use strict';
  describe('ESD API', function() {
    var testCall, service;
    var apiService = {};
    var toastService = {};

    beforeEach(module('horizon.mock.openstack-service-api', function($provide, initServices) {
      testCall = initServices($provide, apiService, toastService);
    }));

    beforeEach(module('horizon.app.core.openstack-service-api'));

    beforeEach(inject(['horizon.app.core.esd', function(esdAPI) {
      service = esdAPI;
    }]));

    it('defines the service', function() {
      expect(service).toBeDefined();
    });

    var tests = [
      {
        func: "getRepoESDs",
        method: "get",
        path: "/api/esd/",
        error: "Unable to retrieve ESDs: undefined"
      },
      {
        func: "getListenerESDs",
        method: "get",
        path: "/api/lbaas/listeners/1234/esds/",
        error: "Unable to retrieve listener's ESDs.",
        testInput: [ '1234' ]
      }
    ];

    // Iterate through the defined tests and apply as Jasmine specs.
    angular.forEach(tests, function(params) {
      it('defines the ' + params.func + ' call properly', function() {
        var callParams = [apiService, service, toastService, params];
        testCall.apply(this, callParams);
      });
    });

    it('supresses the error if instructed for getRepoESDs', function() {
      spyOn(apiService, "get").and.returnValue("promise");
      expect(service.getRepoESDs(true)).toBe("promise");
    });

    it('updateListenerESD', function() {
      spyOn(apiService, "put").and.returnValue("my esd");
      expect(service.updateListenerESD("1234", { id: "5678" }, 1)).toBe("my esd");
    });

    it('addListenerESD', function() {
      spyOn(apiService, "post").and.returnValue("my esd");
      expect(service.addListenerESD("1234", { id: "5678" })).toBe("my esd");
    });

    it('deleteListenerESD', function() {
      spyOn(apiService, "delete").and.returnValue("my esd");
      expect(service.deleteListenerESD("1234", "{}")).toBe("my esd");
    });

  });
})();
