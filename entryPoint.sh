#!/bin/bash
set -xe
: "${WIDGET_DATA_BASE_URL_REPLACE?Need a widget api url}"

sed -i "s/GATEWAY_BASE_URL_REPLACE/$GATEWAY_BASE_URL_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/ENVIRONMENT_REPLACE/$ENVIRONMENT_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/FORM_CONFIG_BASE_URL_REPLACE/$FORM_CONFIG_BASE_URL_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/WIDGET_DATA_BASE_URL_REPLACE/$WIDGET_DATA_BASE_URL_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/MOCK_DATA_BASE_URL_REPLACE/$MOCK_DATA_BASE_URL_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/LAYOUT_CONFIGURATION_BASE_URL_REPLACE/$LAYOUT_CONFIGURATION_BASE_URL_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/BYPASS_LOGIN_REPLACE/$BYPASS_LOGIN_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/base href=\"\/\"/$BASE_HREF_REPLACE/g" /usr/share/nginx/html/index.html
sed -i "s/CSS_THEME_REPLACE/$CSS_THEME_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json
sed -i "s/APP_TITLE_REPLACE/$APP_TITLE_REPLACE/g" /usr/share/nginx/html/assets/config/appconfig.json

exec "$@"
