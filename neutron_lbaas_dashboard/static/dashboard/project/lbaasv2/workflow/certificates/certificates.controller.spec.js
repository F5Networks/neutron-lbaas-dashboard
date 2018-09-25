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
(function() {
  'use strict';

  describe('SSL Certificates Step', function() {
    var certs = [{
      id: '1',
      name: 'foo',
      expiration: '2015-03-26T21:10:45.417835'
    }];

    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    describe('CertificatesController', function() {
      var ctrl, scope, modal;

      beforeEach(inject(function($controller) {
        scope = {
          model: {
            spec: {
              certificates: []
            },
            certificates: certs
          }
        };
        modal = { open: angular.noop };
        ctrl = $controller('CertificatesController', { $scope: scope, $modal: modal });
      }));

      it('should define transfer table properties', function() {
        expect(ctrl.tableData).toBeDefined();
        expect(ctrl.tableLimits).toBeDefined();
        expect(ctrl.tableHelp).toBeDefined();
      });

      it('should have available certificates', function() {
        expect(ctrl.tableData.available).toBeDefined();
        expect(ctrl.tableData.available.length).toBe(1);
        expect(ctrl.tableData.available[0].id).toBe('1');
      });

      it('should not have allocated members', function() {
        expect(ctrl.tableData.allocated).toEqual([]);
      });

      it('should allow adding multiple certificates', function() {
        expect(ctrl.tableLimits.maxAllocation).toBe(-1);
      });

      it('should be callable for $modal.open with parameters-reverse verifying', function() {
        spyOn(modal, 'open');
        expect(modal.open).not.toHaveBeenCalled();
      });

      it('should be callable for $modal.open with parameters', function() {
        spyOn(modal, 'open').and.callFake(function(obj) {
          return obj.resolve.certificateModel();
        });
        ctrl.createSSLCertificate();
        expect(modal.open).toHaveBeenCalled();
      });
    });

  });
})();
