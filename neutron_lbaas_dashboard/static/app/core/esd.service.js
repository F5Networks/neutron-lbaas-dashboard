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
      .module('horizon.app.core.openstack-service-api')
      .factory('horizon.app.core.esd', esdAPI);
  
      esdAPI.$inject = [
      'horizon.framework.util.http.service',
      'horizon.framework.widgets.toast.service'
    ];

    // zongzw TODO: replace all *barbican* in comment, function definition..
    /**
     * @ngdoc service
     * @name horizon.app.core.openstack-service-api.barbican
     * @description Provides direct pass through to barbican with NO abstraction.
     * @param apiService The horizon core API service.
     * @param toastService The horizon toast service.
     * @returns The barbican service API.
     */
  
    function esdAPI(apiService, toastService) {
      var service = {
        getRepoESDs: getRepoESDs,
        getListenerESDs: getListenerESDs,
        updateListenerESD: updateListenerESD,
        addListenerESD: addListenerESD,
        deleteListenerESD: deleteListenerESD
      };
  
      return service;
  
      ///////////////
  
      // SSL Certificate Containers
  
      /**
       * @name horizon.app.core.openstack-service-api.barbican.getCertificates
       * @description
       * Get a list of SSL certificate containers.
       *
       * @param {boolean} quiet
       * The listing result is an object with property "items". Each item is
       * a certificate container.
       */
  
      function getRepoESDs(quiet) {
        var promise = apiService.get('/api/esd/');
        return quiet ? promise : promise.error(function handleError(reason) {
          toastService.add('error',
            gettext('Unable to retrieve ESDs: ' + reason));
        });
      }

      function getListenerESDs(listenerId) {
        return apiService.get('/api/lbaas/listeners/' + listenerId + '/esds/').error(
          function() {
            toastService.add('error', gettext("Unable to retrieve listener's ESDs."))
          });
      }

      function updateListenerESD(listenerId, esd, position) {
        var esdId = esd.id;
        var spec = {
          id: esd.id,
          description: esd.description,
          position: position
        }
        return apiService.put('api/lbaas/listeners/' + listenerId + '/esds/' + esdId + '/', spec);
      }

      function addListenerESD(listenerId, esd) {
        var spec = {
          name: esd.name,
          description: esd.description,
          position: esd.position,
        }
        return apiService.post('api/lbaas/listeners/' + listenerId + '/esds/', spec);
      }

      function deleteListenerESD(listenerId, esd) {
        var esdId = esd.id;
        var spec = {
          id: esd.id,
          description: esd.description,
          position: esd.position
        }
        return apiService.delete('api/lbaas/listeners/' + listenerId + '/esds/' + esdId + '/', spec);
      }
    }
  }());
  