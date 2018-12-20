/*
 *  (c) Copyright 2018, F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  describe('Edit ESD Wizard Controller', function() {
    var ctrl, workflowSpy, $q, scope;
    var model = {
      initialize: function() {
        var defer = $q.defer();
        defer.resolve();
        return defer.promise;
      }
    };
    var workflow = {
      steps: [ { id: 'step1' } ],
      allSteps: [{ id: 'step1' }, { id: 'step2' } ],
      esdStep: { id: 'esd' },
      append: angular.noop
    };

    beforeEach(module('horizon.framework.util'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));
    beforeEach(module(function ($provide) {
      workflowSpy = jasmine.createSpy('workflow').and.returnValue(workflow);
      $provide.value('horizon.dashboard.project.lbaasv2.workflow.model', model);
      $provide.value('horizon.dashboard.project.lbaasv2.workflow.workflow', workflowSpy);
    }));
    beforeEach(inject(function ($controller, $injector) {
      $q = $injector.get('$q');
      scope = $injector.get('$rootScope').$new();
      scope.launchContext = { id: '1234' };
      spyOn(model, 'initialize').and.callThrough();
      ctrl = $controller('EditESDWizardController', { $scope: scope });
    }));

    it('defines the controller', function() {
      expect(ctrl).toBeDefined();
    });

    it('calls initialize on the given model', function() {
      expect(model.initialize).toHaveBeenCalledWith('esd', '1234');
    });

    it('sets scope.workflow to the given workflow', function() {
      expect(scope.workflow).toBe(workflow);
    });

    it('initializes workflow with correct properties', function() {
      expect(workflowSpy).toHaveBeenCalledWith('Update Listener ESD',
        'fa fa-pencil', ['esd'], jasmine.any(Object));
    });

    it('adds necessary steps after initializing', function() {
      model.visibleResources = [ 'esd' ];
      spyOn(workflow, 'append');
      scope.$apply();

      expect(workflow.append).toHaveBeenCalledWith({id: 'esd'});
    });

    it('do not need to add steps after initializing', function() {
      model.visibleResources = [ 'esd' ];
      workflow.steps = [ { id: 'esd' } ];
      spyOn(workflow, 'append');
      scope.$apply();

      expect(workflow.append).not.toHaveBeenCalledWith({id: 'esd'});
    });

    it('submit do nothing', function() {
      scope.submit();
    });
  });

})();
