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
    'horizon.framework.util.i18n.gettext',
    'horizon.app.core.esd'
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

  function ESDController($scope, gettext, esdAPI) {

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
    ctrl.lastlog = gettext("");
    var working = false;

    ctrl.allocate = allocate;
    ctrl.deallocate = deallocate;
    ctrl.update = update;

    function allocate(data) {
      if (working) {
        ctrl.lastlog += " [Wait]";
        return;
      } else {
        working = true;
      }

      var trCtrl = data[0];
      var row = data[1];

      if (row.status !== 'Normal') {
        ctrl.lastlog = gettext("ESD status is '" +
                       row.status + "', cannot be allocated, fix it first.");
        working = false;
      } else {
        ctrl.lastlog = gettext("Allocating '" + row.name + "' to the listener ...");
        esdAPI.addListenerESD($scope.model.context.id, row).then(
          function(result) {
            ctrl.lastlog = ctrl.lastlog + " [Done]";
            row.id = result.data.id;
            trCtrl.allocate(row);
            working = false;
          },
          function(reason) {
            ctrl.lastlog = ctrl.lastlog + " [Failed]: " + reason;
            working = false;
          }
        );
      }
    }

    function deallocate(data) {
      if (working) {
        ctrl.lastlog += " [Wait]";
        return;
      } else {
        working = true;
      }

      var trCtrl = data[0];
      var row = data[1];

      ctrl.lastlog = gettext("Deallocating '" + row.name + "' from the listener ...");
      esdAPI.deleteListenerESD($scope.model.context.id, row).then(
        function() {
          ctrl.lastlog = ctrl.lastlog + " [Done]";
          trCtrl.deallocate(row);
          working = false;
        },
        function(reason) {
          ctrl.lastlog = ctrl.lastlog + " [Failed]: " + reason;
          working = false;
        }
      );
    }

    function update(trCtrl, e, item, collection) {
      if (working) {
        ctrl.lastlog += " [Wait]";
        return;
      } else {
        working = true;
      }

      var position = collection.indexOf(item) + 1;

      ctrl.lastlog = gettext("Reordering '" + item.name +
                     "' for the listener to " + position + " ...");
      esdAPI.updateListenerESD($scope.model.context.id, item, position).then(
        function() {
          ctrl.lastlog = ctrl.lastlog + " [Done]";
          trCtrl.updateAllocated(e, item, collection);
          working = false;
        },
        function(reason) {
          ctrl.lastlog = ctrl.lastlog + " [Failed]: " + reason;
          working = false;
        }
      );
    }
  }
})();

