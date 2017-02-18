define(["common/rivetsExtra","jquery","windows/windows","text!./taxInformation.html","websockets/binary_websockets","css!taxInformation/taxInformation.css","common/util","jquery-growl"],function(a,b,c,d,e){"use strict";function f(a){return a&&a.__esModule?a:{"default":a}}var g=f(a),h=f(b),i=f(c),j=f(d),k=f(e);k["default"].events.on("login",function(){Cookies.loginids()[0].is_mf&&k["default"].send({get_account_status:1}).then(function(a){/crs_tin_information/.test(a.get_account_status.status)||Promise.all([k["default"].send({get_settings:1}),k["default"].send({residence_list:1})]).then(function(a){var b=i["default"].createBlankWindow(h["default"](j["default"]).i18n(),{title:"Tax Information".i18n(),width:700,height:280,resizable:!1,collapsable:!1,minimizable:!1,maximizable:!1,closable:!1,closeOnEscape:!1,modal:!0,ignoreTileAction:!0,close:function(){b.dialog("destroy")}}),c={empty_fields:{show:function(){c.empty_fields.validate=!0,c.empty_fields.clear()},clear:_.debounce(function(){c.empty_fields.validate=!1},4e3),validate:!1},place_of_birth:a[1].residence_list[0].value,tax_residence:"",tax_identification_number:"",country_array:a[1].residence_list,submit_disabled:!1,cancel:function(){k["default"].invalidate(),b.dialog("close")},submit:function(){if(!c.isValid())return void c.empty_fields.show();c.submit_disabled=!0;var d=a[0].get_settings;k["default"].send({address_line_1:d.address_line_1,address_city:d.address_city,phone:d.phone,place_of_birth:c.place_of_birth,set_settings:1,tax_identification_number:c.tax_identification_number,tax_residence:c.tax_residence.join(",")}).then(function(){h["default"].growl.notice({message:"Tax Information successfully updated".i18n()}),b.dialog("close")})["catch"](function(a){h["default"].growl.error({message:a.msg})})},isValid:function(){return c.place_of_birth&&c.tax_residence&&c.tax_identification_number&&/^[\w-]{0,20}$/.test(c.tax_identification_number)}};g["default"].bind(b,c),b.dialog("open")})})["catch"](function(a){h["default"].growl.error({message:a.msg})})})});