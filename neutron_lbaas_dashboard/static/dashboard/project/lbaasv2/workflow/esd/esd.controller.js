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

(function () {
    'use strict';
  
    angular
      .module('horizon.dashboard.project.lbaasv2')
      .controller('ESDController', ESDController);
  
      ESDController.$inject = [
      '$scope',
      'horizon.framework.util.i18n.gettext'
    ];
  
    /**
     * @ngdoc controller
     * @name ESDController
     * @description
     * The `ESDController` controller provides functions for adding ESDs to a
     * listener.
     * @param $scope The angular scope object.
     * @param gettext The horizon gettext function for translation.
     * @returns undefined
     */
  
    function ESDController($scope, gettext) {
  
      var ctrl = this;
  
      ctrl.tableData = {
        available: $scope.model.esds,
        allocated: $scope.model.spec.esds,
        displayedAvailable: [],
        displayedAllocated: []
      };
  
      ctrl.tableLimits = {
        maxAllocation: -1
      };
  
      ctrl.tableHelp = {
        availHelpText: '',
        noneAllocText: gettext('Select ESD from the available ESDs below'),
        noneAvailText: gettext('No available ESDs')
      };

      ctrl.deallocate = function(data) {
        var trCtrl = data[0];
        var row = data[1]
        
        // api call to apply new changes.
        // here

        trCtrl.deallocate(row);
      };

      ctrl.allocate = function(data) {
        var trCtrl = data[0];
        var row = data[1]
        
        // api call to apply new changes.
        // here
        
        trCtrl.allocate(row);
      };

      ctrl.updateAllocated = function(trCtrl, e, item, collection) {
        console.log(item, collection);

        // api call to apply new changes.
        // here
        
        trCtrl.updateAllocated(e, item, collection);
      }

    }
  })();
  