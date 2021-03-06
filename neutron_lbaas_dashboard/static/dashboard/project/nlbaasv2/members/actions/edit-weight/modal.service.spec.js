/*
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  describe('LBaaS v2 Member Edit Weight Service', function() {
    var service, policy, $scope, $route, $uibModal, toast;
    var member = { id: 'member1' };

    var fakePromise = function(response) {
      return {
        then: function(func) {
          return func(response);
        }
      };
    };

    function allowed(item) {
      spyOn(policy, 'ifAllowed').and.returnValue(true);
      var promise = service.allowed(item);
      var allowed;
      promise.then(function() {
        allowed = true;
      }, function() {
        allowed = false;
      });
      $scope.$apply();
      expect(policy.ifAllowed).toHaveBeenCalledWith({rules: [['neutron', 'pool_member_update']]});
      return allowed;
    }

    beforeEach(module('horizon.framework.util'));
    beforeEach(module('horizon.framework.conf'));
    beforeEach(module('horizon.framework.widgets'));
    beforeEach(module('horizon.app.core.openstack-service-api'));
    beforeEach(module('horizon.dashboard.project.nlbaasv2'));

    beforeEach(module(function($provide) {
      $provide.value('$uibModal', {
        open: function() {
          return {
            result: fakePromise()
          };
        }
      });
    }));

    beforeEach(inject(function ($injector) {
      policy = $injector.get('horizon.app.core.openstack-service-api.policy');
      toast = $injector.get('horizon.framework.widgets.toast.service');
      $scope = $injector.get('$rootScope').$new();
      $route = $injector.get('$route');
      $uibModal = $injector.get('$uibModal');
      service = $injector.get(
        'horizon.dashboard.project.nlbaasv2.members.actions.edit-weight.modal.service');
      service.init('pool1', fakePromise());
    }));

    it('should have the "allowed" and "perform" functions', function() {
      expect(service.allowed).toBeDefined();
      expect(service.perform).toBeDefined();
    });

    it('should check policy to allow the action', function() {
      expect(allowed(member)).toBe(true);
    });

    it('should open the modal', function() {
      spyOn($uibModal, 'open').and.callThrough();
      service.perform(member);
      $scope.$apply();
      expect($uibModal.open.calls.count()).toBe(1);
    });

    it('should resolve data for passing into the modal', function() {
      spyOn($uibModal, 'open').and.callThrough();
      service.perform(member);
      $scope.$apply();

      var resolve = $uibModal.open.calls.argsFor(0)[0].resolve;
      expect(resolve).toBeDefined();
      expect(resolve.poolId()).toBe('pool1');
      expect(resolve.member()).toBe(member);
    });

    it('should show message and reload page upon closing modal', function() {
      spyOn(toast, 'add');
      spyOn($route, 'reload');
      service.perform(member);
      $scope.$apply();
      expect(toast.add).toHaveBeenCalledWith('success', 'Pool member weight has been updated.');
      expect($route.reload).toHaveBeenCalled();
    });

  });

})();
