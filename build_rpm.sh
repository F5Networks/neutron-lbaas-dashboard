#!/bin/bash

git checkout -- setup.cfg
rm -rf build dist *.egg *.egg-info

# Build community source tarball

python setup.py sdist --formats=gztar

# Build F5 rpm spec

/bin/cp -f f5-setup.cfg setup.cfg

python setup.py bdist_rpm --spec-only \
  --release=1 \
  --provides=f5-neutron-lbaas-dashboard \
  --packager="Qin Zhao <q.zhao@f5.com>" \
  --post-install=rpm_post_install.sh

# Repackage source tarball

F5_VERSION=$(cat f5-version.txt)

cd dist
VERSION=$(rpmspec -q --qf "%{version}" f5-neutron-lbaas-dashboard.spec)
sed -i "s/${VERSION}/${F5_VERSION}/g" f5-neutron-lbaas-dashboard.spec

OLD=neutron-lbaas-dashboard-${VERSION}
NEW=f5-neutron-lbaas-dashboard-${F5_VERSION}

tar -zxf ${OLD}.tar.gz

mv ${OLD} ${NEW}

cd ${NEW}

/bin/cp -f f5-setup.cfg setup.cfg

mv neutron_lbaas_dashboard/enabled/_1481_project_ng_loadbalancersv2_panel.py neutron_lbaas_dashboard/enabled/_1491_project_ng_loadbalancersv2_panel.py

mv neutron_lbaas_dashboard f5_neutron_lbaas_dashboard

rm -rf neutron_lbaas_dashboard.egg-info

cp -rp ../../f5_neutron_lbaas_dashboard.egg-info ./

sed -i "s/^Version: ${VERSION}/Version: ${F5_VERSION}/" f5_neutron_lbaas_dashboard.egg-info/PKG-INFO

sed -i "s/^neutron_lbaas_dashboard/f5_neutron_lbaas_dashboard/g" f5_neutron_lbaas_dashboard.egg-info/SOURCES.txt

sed -i "s/_1481_project_ng_loadbalancersv2_panel.py/_1491_project_ng_loadbalancersv2_panel.py/" f5_neutron_lbaas_dashboard.egg-info/SOURCES.txt

/bin/cp -f f5_neutron_lbaas_dashboard.egg-info/PKG-INFO ./

/bin/cp -f f5_neutron_lbaas_dashboard.egg-info/SOURCES.txt ./

find f5_neutron_lbaas_dashboard -type f -exec sed -i "s/neutron_lbaas_dashboard/f5_neutron_lbaas_dashboard/g" {} \;

cd ..

tar -cf ${NEW}.tar ${NEW}
gzip ${NEW}.tar

# Build F5 rpm

cp ${NEW}.tar.gz ~/rpmbuild/SOURCES

rpmbuild -bb f5-neutron-lbaas-dashboard.spec

cp ~/rpmbuild/RPMS/noarch/${NEW}*.rpm ./

cd ..
