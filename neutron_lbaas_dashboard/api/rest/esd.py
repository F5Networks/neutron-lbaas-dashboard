# Copyright 2018, F5 Networks, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""ESD API over the neutron LBaaS v2 service.
"""

from django.utils.translation import ugettext_lazy as _
from django.views import generic

import json
import logging

from openstack_dashboard.api import neutron
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils

import os

neutronclient = neutron.neutronclient
LOG = logging.getLogger(__name__)


def associate_esd(request, listener_id, esd):
    """Associate an ESD with a listener.

    """

    l7policySpec = {
        'listener_id': listener_id,
        'action': 'REJECT'
    }

    l7policySpec['name'] = esd['name']
    if esd.get('description'):
        l7policySpec['description'] = esd['description']
    if esd.get('position'):
        l7policySpec['position'] = esd['position']

    return neutronclient(request).create_lbaas_l7policy(
        {'l7policy': l7policySpec}).get('l7policy')


def list_esds(request, listener_id):
    """List all ESDs associated with a listener.

    """

    l7policies = []
    if listener_id:
        l7policies = neutronclient(request).list_lbaas_l7policies(
            listener_id=listener_id).get('l7policies')

    esds = [None] * len(l7policies)
    for policy in l7policies:
        # Guarantee ESD array order is consistent with ESD poistion property
        esds[policy['position'] - 1] = policy

    return esds


def show_esd(request, l7policy_id):
    """Show a single ESD

    """

    if l7policy_id:
        return neutronclient(request).show_lbaas_l7policy(
            l7policy_id).get('l7policy')


def update_esd(request, esd):
    """Updte the description or position of an ESD with a listener

    """

    l7policySpec = {}

    if esd.get('description'):
        l7policySpec['description'] = esd['description']

    if esd.get('position'):
        l7policySpec['position'] = esd['position']

    return neutronclient(request).update_lbaas_l7policy(
        esd['id'], {'l7policy': l7policySpec}).get('l7policy')


def dissociate_esd(request, l7policy_id):
    """Dissociate an ESD with a listener.

    """

    if l7policy_id:
        neutronclient(request).delete_lbaas_l7policy(l7policy_id)

    return


@urls.register
class RepoESDs(generic.View):
    """API for associating, retrieving ESD associated with a listener.

    """
    url_regex = r'esd/$'

    @rest_utils.ajax()
    def get(self, request):
        """List esd containers.

        The listing result is an object with property "items".
        """

        esds = {}
        esddir = '/etc/openstack-dashboard/esds'
        try:
            files = os.listdir(esddir)
        except Exception as e:
            errmsg = _("Failed to list directory '%(esddir)s': %(err)s")\
                % {'esddir': esddir, 'err': e}
            LOG.error(errmsg)
            esds['_FAULT_FOLDER'] = {
                'status': 'Folder Error',
                'description': errmsg
            }
            return {'items': esds}

        for file in files:
            path = os.path.join(esddir, file)
            try:
                with open(path) as fr:
                    esdjson = json.load(fr)
                    for k, v in esdjson.items():
                        if k in esds:
                            warnmsg = _("Duplicate esd: %s, overriden.") % k
                            LOG.warning(warnmsg)
                            esds[k]['status'] = 'Duplicate Definition'
                            desc = 'Definition 1: %s, Definition 2: %s' % (
                                v, esds[k]['content'])
                            esds[k]['description'] = desc
                        else:
                            esds[k] = {
                                'status': "Normal",
                                'description': '-',
                                'content': v
                            }
            except Exception as e:
                errmsg = _("Failed to load esd file '%(path)s': %(err)s.")\
                    % {'path': path, 'err': e}
                LOG.error(errmsg)
                esds['_FAULT_FILE_%s' % file] = {
                    'status': 'File Error',
                    'description': errmsg
                }

        return {'items': esds}


@urls.register
class ListenerESDs(generic.View):
    '''API for post and get to listener's ESDS.

    '''

    url_regex = r'lbaas/listeners/(?P<listener_id>[^/]+)/esds/$'

    @rest_utils.ajax()
    def post(self, request, listener_id):
        """Associate an ESD with a listener

        """
        spec = {
            'name': request.DATA.get('name'),
            'description': request.DATA.get('description'),
            'position': request.DATA.get('position')
        }
        return associate_esd(request, listener_id, spec)

    @rest_utils.ajax()
    def get(self, request, listener_id):
        """Get all ESDs associated with a listener

        """
        return list_esds(request, listener_id)


@urls.register
class ListenerESD(generic.View):
    """API for retrieving, updating, and dessociating a single ESD with a listener.

    """
    url_regex = r'lbaas/listeners/(?P<listener_id>[^/]+)' + \
                '/esds/(?P<esd_id>[^/]+)/$'

    @rest_utils.ajax()
    def get(self, request, esd_id, listener_id):
        """Get an ESD

        """
        return show_esd(request, esd_id)

    @rest_utils.ajax()
    def put(self, request, esd_id, listener_id):
        """Update an ESD

        """
        data = request.DATA
        spec = {
            'id': esd_id,
            'description': data.get('description'),
            'position': data.get('position')
        }
        return update_esd(request, spec)

    @rest_utils.ajax()
    def delete(self, request, esd_id, listener_id):
        """Dissociate an ESD with a listener

        """
        dissociate_esd(request, esd_id)
        return
