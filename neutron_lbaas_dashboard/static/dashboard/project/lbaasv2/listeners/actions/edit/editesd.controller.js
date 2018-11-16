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

  angular
    .module('horizon.dashboard.project.lbaasv2.loadbalancers')
    .controller('EditESDWizardController', EditESDWizardController);

  EditESDWizardController.$inject = [
    '$scope',
    '$q',
    'horizon.dashboard.project.lbaasv2.workflow.model',
    'horizon.dashboard.project.lbaasv2.workflow.workflow',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc controller
   * @name EditESDWizardController
   *
   * @description
   * Controller for the LBaaS v2 edit listener wizard.
   *
   * @param $scope The angular scope object.
   * @param $q The angular service for promises.
   * @param model The LBaaS V2 workflow model service.
   * @param workflowService The LBaaS V2 workflow service.
   * @param gettext The horizon gettext function for translation.
   * @returns undefined
   */

  function EditESDWizardController($scope, $q, model, workflowService, gettext) {
    var scope = $scope;
    var defer = $q.defer();
    scope.model = model;
    scope.submit = submit;
    scope.workflow = workflowService(
      gettext('Update Listener ESD'),
      'fa fa-pencil', ['esd'],
      defer.promise);
    var allSteps = [scope.workflow.esdStep];

    scope.model.initialize('esd', scope.launchContext.id).then(addSteps).then(ready);

    function addSteps() {
      var steps = scope.model.visibleResources;
      steps.map(getStep).forEach(function addStep(step) {
        if (!stepExists(step.id)) {
          scope.workflow.append(step);
        }
      });
    }

    function getStep(id) {
      return allSteps.filter(function findStep(step) {
        return step.id === id;
      })[0];
    }

    function stepExists(id) {
      return scope.workflow.steps.some(function exists(step) {
        return step.id === id;
      });
    }

    function ready() {
      defer.resolve();
    }

    function submit() {
      //esd operation would apply in-time, so do nothing here.
      defer.resolve();
      return defer.promise;
    }
  }

})();

