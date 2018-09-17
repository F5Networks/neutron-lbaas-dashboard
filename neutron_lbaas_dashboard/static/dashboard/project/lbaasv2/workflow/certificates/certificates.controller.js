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

  angular
    .module('horizon.dashboard.project.lbaasv2')
    .controller('CertificatesController', CertificatesController);

  CertificatesController.$inject = [
    '$scope',
    '$modal',
    'horizon.dashboard.project.lbaasv2.basePath',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc controller
   * @name CertificatesController
   * @description
   * The `CertificatesController` controller provides functions for adding certificates to a
   * listener.
   * @param $scope The angular scope object.
   * @param gettext The horizon gettext function for translation.
   * @returns undefined
   */

  function CertificatesController($scope, $modal, basePath, gettext) {

    var ctrl = this;

    ctrl.createSSLCertificate = createSSLCertificate;

    ctrl.tableData = {
      available: $scope.model.certificates,
      allocated: $scope.model.spec.certificates,
      displayedAvailable: [],
      displayedAllocated: []
    };

    ctrl.tableLimits = {
      maxAllocation: -1
    };

    ctrl.tableHelp = {
      availHelpText: '',
      noneAllocText: gettext('Select certificates from the available certificates below'),
      noneAvailText: gettext('No available certificates')
    };

    /**
     * @ngdoc function
     * @name createSSLCertificate
     * @description
     * Create a new SSL Certificate for TERMINATED_HTTPS protocol
     * @returns {undefined} undefined
     */
    function createSSLCertificate() {
      $modal.open({
        templateUrl: basePath + 'workflow/certificates/create-certificate.html',
        controller: 'LaunchLoadBalancerCreateCertificateController as ctrl',
        windowClass: 'modal-dialog-wizard',
        resolve: {
          certificateModel: getModel
        }
      });
    }

     /**
     * @ngdoc function
     * @name getModel
     * @description
     * Pass the model to ssl certificate creation controller.
     * @returns {model} certificate model
     */
    function getModel() {
      return $scope.model;
    }
  }
})();
