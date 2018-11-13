# Copyright 2018 F5 Networks, Inc.
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

from django.views import generic

from openstack_dashboard.api import neutron
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils

neutronclient = neutron.neutronclient


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
    neutronclient(request).create_lbaas_l7policy(
        {'l7policy': l7policySpec})

    return


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

    if l7policySpec.get('description') or l7policySpec.get('position'):
        neutronclient(request).update_lbaas_l7policy(
            esd['id'], {'l7policy': l7policySpec})

    return


def dissociate_esd(request, l7policy_id):
    """Dissociate an ESD with a listener.

    """

    if l7policy_id:
        neutronclient(request).delete_lbaas_l7policy(l7policy_id)

    return


@urls.register
class ESDs(generic.View):
    """API for associating, retrieving ESD associated with a listener.

    """
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
        associate_esd(request, listener_id, spec)

        return

    @rest_utils.ajax()
    def get(self, request, listener_id):
        """Get all ESDs associated with a listener

        """
        return list_esds(request, listener_id)


@urls.register
class ESD(generic.View):
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
        update_esd(request, {'esd', spec})

        return

    @rest_utils.ajax()
    def delete(self, request, esd_id, listener_id):
        """Dissociate an ESD with a listener

        """
        dissociate_esd(request, esd_id)

        return
