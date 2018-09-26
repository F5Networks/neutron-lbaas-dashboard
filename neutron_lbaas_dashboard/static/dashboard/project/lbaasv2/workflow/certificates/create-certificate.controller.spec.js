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

  describe("Create Certificate", function() {

    var ctrl, scope, $q, barbicanEnabled, certificateOK, secretOK;

    var modalInstanceMock = {
      close: angular.noop,
      dismiss: angular.noop
    };

    var barbicanAPI = {
      createCertificate: function() {
        var deferred = $q.defer();
        deferred[certificateOK ? 'resolve' : 'reject']();
        return deferred.promise;
      },
      createSecret: function() {
        var deferred = $q.defer();
        deferred[secretOK ? 'resolve' : 'reject']({
          data:{
            secret_ref: "data"
          }});
        return deferred.promise;
      }
    };

    var certificateModelMock = {
      certificates: [],
      prepareCertificates: angular.noop
    };
    var serviceCatalog = {
      ifTypeEnabled: function() {
        var deferred = $q.defer();
        deferred[barbicanEnabled ? 'resolve' : 'reject']("data");
        scope.$apply();
        return deferred.promise;
      }
    };

    var gettextMock = function(text) {
      return text;
    };

    var toastServiceMock = {
      add: angular.noop
    };

    beforeEach(module('horizon.framework'));
    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));
    beforeEach(module('horizon.app.core.openstack-service-api'));

    beforeEach(inject(function($injector, $controller) {
      $q = $injector.get('$q');
      scope = $injector.get('$rootScope').$new();

      ctrl = $controller('LaunchLoadBalancerCreateCertificateController', {
        $q: $q,
        $modalInstance: modalInstanceMock,
        certificateModel: certificateModelMock,
        'horizon.framework.util.i18n.gettext': gettextMock,
        'horizon.framework.widgets.toast.service': toastServiceMock,
        'horizon.app.core.openstack-service-api.serviceCatalog': serviceCatalog,
        'horizon.app.core.openstack-service-api.barbican': barbicanAPI
      });
    }));

    beforeEach(function() {
      spyOn(modalInstanceMock, 'close');
      spyOn(toastServiceMock, 'add');
    });

    it('controller variables are finely defined.', function() {
      expect(ctrl.passType).toBe('text');
      expect(ctrl.statusCreating).toBe(false);

      var errMsgCheckList = [
        'certNameError',
        'certificateError',
        'privateKeyError',
        'intermediateError'
      ];
      angular.forEach(errMsgCheckList, function(checkItem) {
        expect(ctrl[checkItem]).toBeDefined();
      });

      expect(ctrl.certificateSpec).toBeDefined();
      var certificateTypes = [
        'certificate',
        'private_key',
        'passphrase',
        'intermediate'
      ];
      angular.forEach(certificateTypes, function(key) {
        var item = ctrl.certificateSpec[key];
        expect(item.name).toBe('');
        expect(item.payload).toBe('');
        expect(item.payload_content_type).toBe('text/plain');
      });

      expect(ctrl.containerSpec).toBeDefined();
      expect(ctrl.containerSpec.type).toBe('certificate');
      expect(ctrl.containerSpec.name).toBe(ctrl.certificateSpec.certificate.name);
      expect(ctrl.containerSpec.secret_refs.push('data')).toBe(1);
    });

    it('should call keymanagerNotSupport', function() {
      barbicanEnabled = false;

      spyOn(barbicanAPI, 'createSecret').and.callFake(angular.noop);
      ctrl.submit();
      scope.$apply();

      expect(toastServiceMock.add).toHaveBeenCalledWith(
        'error',
        "Unable to connect to key manager."
      );
      expect(barbicanAPI.createSecret).not.toHaveBeenCalled();
    });

    it('should call createSecret with the tuple of 4 secrets but failed.', function() {
      barbicanEnabled = true;
      secretOK = false;
      ctrl.certificateSpec.passphrase.payload = 'data';
      ctrl.certificateSpec.intermediate.payload = 'data';
      ctrl.submit();
      scope.$apply();

      expect(toastServiceMock.add).toHaveBeenCalled();
      expect(toastServiceMock.add).toHaveBeenCalledWith(
        'error',
        'Error(s) in creating secrets.'
      );

    });

    it('should call createSecret with the tuple of 2 secrets but failed.', function() {
      barbicanEnabled = true;
      secretOK = false;
      ctrl.certificateSpec.passphrase.payload = '';
      ctrl.submit();
      scope.$apply();

      expect(toastServiceMock.add).toHaveBeenCalled();
      expect(toastServiceMock.add).toHaveBeenCalledWith(
        'error',
        'Error(s) in creating secrets.'
      );

    });

    it('should call createContainer but failed.', function() {
      barbicanEnabled = true;
      secretOK = true;
      certificateOK = false;
      ctrl.certificateSpec.passphrase.payload = 'data';
      ctrl.certificateSpec.intermediate.payload = 'data';

      ctrl.submit();
      scope.$apply();

      expect(toastServiceMock.add).toHaveBeenCalled();
      expect(toastServiceMock.add).toHaveBeenCalledWith(
        'error',
        'Unable to create container.'
      );
      expect(ctrl.containerSpec.secret_refs.length).toBe(4);
    });

    it('should call createContainer and succeed.', function() {
      barbicanEnabled = true;
      secretOK = true;
      certificateOK = true;
      spyOn(certificateModelMock, 'prepareCertificates');

      ctrl.submit();
      scope.$apply();

      expect(toastServiceMock.add).toHaveBeenCalled();
      expect(toastServiceMock.add).toHaveBeenCalledWith(
        'success',
        'Certificates creation succeeds.'
      );
      expect(certificateModelMock.prepareCertificates).toHaveBeenCalled();

    });

    it('should call cancel', function() {
      spyOn(modalInstanceMock, 'dismiss');
      ctrl.cancel();

      expect(modalInstanceMock.dismiss).toHaveBeenCalled();
    });

    it('should call afterCertName', function() {
      ctrl.certificateSpec.certificate.name = "data";

      ctrl.afterCertName();

      expect(ctrl.certificateSpec.private_key.name).toBe("data-private_key");
    });

    it('should call revealPassword and hidePassword', function() {
      ctrl.revealPassword();
      expect(ctrl.passType).toBe("text");

      ctrl.hidePassword();
      expect(ctrl.passType).toBe('password');
    });

    it('should call doesCertificateExist and return expect.', function() {
      certificateModelMock.certificates = [
        {name: 'a', value: 1},
        {name: 'b', value: 2}
      ];

      ctrl.certificateSpec.certificate.name = 'c';
      expect(ctrl.doesCertificateExist()).toBe(false);

      ctrl.certificateSpec.certificate.name = 'b';
      expect(ctrl.doesCertificateExist()).toBe(true);

    });

  });

})();
