mkdir -p /usr/share/openstack-dashboard/openstack_dashboard/local/enabled/
cd /usr/lib/python2.7/site-packages
install -p -D -m 644 f5_neutron_lbaas_dashboard/enabled/_1491_project* /usr/share/openstack-dashboard/openstack_dashboard/local/enabled/
