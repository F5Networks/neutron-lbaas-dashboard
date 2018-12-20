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

  describe('ESD Step', function() {
    var myESDs = [{
      id: '1',
      name: 'foo'
    }];

    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));
    beforeEach(module('horizon.app.core'));

    describe('ESDController', function() {
      var esdAPI, ctrl, scope, $q;

      function makePromise(reject, param) {
        var deferred = $q.defer();
        deferred[reject ? 'reject' : 'resolve'](param);
        return deferred.promise;
      }

      beforeEach(inject(function($injector) {
        $q = $injector.get('$q');
        scope = $injector.get('$rootScope').$new();

        var myScope = {
          $apply: scope.$apply,
          model: {
            context: { id: "unknown" },
            spec: {
              esds: []
            },
            esds: myESDs
          }
        };

        esdAPI = $injector.get('horizon.app.core.esd');
        var controller = $injector.get('$controller');
        ctrl = controller('ESDController', { $scope: myScope });
      }));

      it('should define transfer table properties', function() {
        expect(ctrl.tableData).toBeDefined();
        expect(ctrl.tableLimits).toBeDefined();
        expect(ctrl.tableHelp).toBeDefined();
      });

      it('should have available esds', function() {
        expect(ctrl.tableData.available).toBeDefined();
        expect(ctrl.tableData.available.length).toBe(1);
        expect(ctrl.tableData.available[0].id).toBe('1');
      });

      it('should not have allocated esds', function() {
        expect(ctrl.tableData.allocated).toEqual([]);
      });

      it('should allow adding multiple esds', function() {
        expect(ctrl.tableLimits.maxAllocation).toBe(-1);
      });

      it('allocate normal esd', function() {
        spyOn(esdAPI, 'addListenerESD').and.returnValue(
          makePromise(false, { data: { id: "5678" }}));
        ctrl.allocate([ { allocate: angular.noop }, { name: "faked", status: "Normal" } ]);
        scope.$apply();
        expect(ctrl.lastlog).toBe("Allocating 'faked' to the listener ... [Done]");
      });

      it('allocate normal esd fail', function() {
        spyOn(esdAPI, 'addListenerESD').and.returnValue(makePromise(true, "unknown reason"));
        ctrl.allocate([ { allocate: angular.noop }, { name: "faked", status: "Normal" } ]);
        scope.$apply();
        expect(ctrl.lastlog).toBe(
          "Allocating 'faked' to the listener ... [Failed]: unknown reason");
      });

      it('allocate abnormal esd', function() {
        ctrl.allocate([ { allocate: angular.noop }, { name: "faked", status: "Abnormal" } ]);
        expect(ctrl.lastlog).toBe("ESD status is 'Abnormal', cannot be allocated, fix it first.");
      });

      it('allocate esd when working', function() {
        ctrl.working = true;
        ctrl.allocate();
        expect(ctrl.lastlog).toBe(" [Wait]");
      });

      it('deallocate esd', function() {
        spyOn(esdAPI, 'deleteListenerESD').and.returnValue(makePromise(false));
        ctrl.deallocate([ { deallocate: angular.noop }, { name: "faked"} ]);
        scope.$apply();
        expect(ctrl.lastlog).toBe("Deallocating 'faked' from the listener ... [Done]");
      });

      it('deallocate esd fail', function() {
        spyOn(esdAPI, 'deleteListenerESD').and.returnValue(makePromise(true, "unknown reason"));
        ctrl.deallocate([ { deallocate: angular.noop }, { name: "faked"} ]);
        scope.$apply();
        expect(ctrl.lastlog).toBe(
          "Deallocating 'faked' from the listener ... [Failed]: unknown reason");
      });

      it('deallocate esd when working', function() {
        ctrl.working = true;
        ctrl.deallocate();
        expect(ctrl.lastlog).toBe(" [Wait]");
      });

      it('update esd', function() {
        spyOn(esdAPI, 'updateListenerESD').and.returnValue(makePromise(false));
        ctrl.update({ updateAllocated: angular.noop }, {},
                    { name: "faked"}, { indexOf: function () { return 0; } });
        scope.$apply();
        expect(ctrl.lastlog).toBe("Reordering 'faked' for the listener to 1 ... [Done]");
      });

      it('update esd fail', function() {
        spyOn(esdAPI, 'updateListenerESD').and.returnValue(makePromise(true, "unknown reason"));
        ctrl.update({ updateAllocated: angular.noop }, {},
                    { name: "faked"}, { indexOf: function () { return 0; } });
        scope.$apply();
        expect(ctrl.lastlog).toBe(
          "Reordering 'faked' for the listener to 1 ... [Failed]: unknown reason");
      });

      it('update esd when working', function() {
        ctrl.working = true;
        ctrl.update();
        expect(ctrl.lastlog).toBe(" [Wait]");
      });

    });

  });
})();
