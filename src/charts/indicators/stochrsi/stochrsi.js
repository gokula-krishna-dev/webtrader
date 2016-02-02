﻿/**
 * Created by Mahboob.M on 2/2/15.
 */

define(["jquery", "jquery-ui", 'color-picker', 'ddslick'], function ($) {

    function closeDialog() {
        $(this).dialog("close");
        $(this).find("*").removeClass('ui-state-error');
    }

    function init(containerIDWithHash, _callback) {

        require(['css!charts/indicators/stochrsi/stochrsi.css']);

        var Level = function (level, stroke, strokeWidth, dashStyle) {
            this.level = level;
            this.stroke = stroke;
            this.strokeWidth = strokeWidth;
            this.dashStyle = dashStyle;
        };
        var defaultLevels = [new Level(0.2, 'red', 1, 'Dash'), new Level(0.8, 'red', 1, 'Dash')];

        require(['text!charts/indicators/stochrsi/stochrsi.html'], function ($html) {

            var defaultStrokeColor = '#cd0a0a';

            $html = $($html);
            //$html.hide();
            $html.appendTo("body");
            $html.find("input[type='button']").button();

            $html.find("#stochrsi_stroke").colorpicker({
                part: {
                    map: { size: 128 },
                    bar: { size: 128 }
                },
                select: function (event, color) {
                    $("#stochrsi_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                },
                ok: function (event, color) {
                    $("#stochrsi_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                }
            });

            var selectedDashStyle = "Solid";
            $('#stochrsi_dashStyle').ddslick({
                imagePosition: "left",
                width: 118,
                background: "white",
                onSelected: function (data) {
                    $('#stochrsi_dashStyle .dd-selected-image').css('max-width', '85px');
                    selectedDashStyle = data.selectedData.value
                }
            });
            $('#stochrsi_dashStyle .dd-option-image').css('max-width', '85px');

            var table = $html.find('#stochrsi_levels').DataTable({
                paging: false,
                scrollY: 100,
                autoWidth: true,
                searching: false,
                info: false,
                "columnDefs": [
                   { className: "dt-center", "targets": [0, 1, 2, 3] }
                ],
                "aoColumnDefs": [{ "bSortable": false, "aTargets": [1, 3] }]
            });
            $.each(defaultLevels, function (index, value) {
                $(table.row.add([value.level, '<div style="background-color: ' + value.stroke + ';width:100%;height:20px;"></div>', value.strokeWidth,
                    '<div style="width:50px;overflow:hidden;"><img src="images/dashstyle/' + value.dashStyle + '.svg" /></div>']).draw().node())
                    .data("level", value)
                    .on('click', function () {
                        $(this).toggleClass('selected');
                    });
            });
            $html.find('#stochrsi_level_delete').click(function () {
                if (table.rows('.selected').indexes().length <= 0) {
                    require(["jquery", "jquery-growl"], function ($) {
                        $.growl.error({ message: "Select levels to delete!" });
                    });
                } else {
                    table.rows('.selected').remove().draw();
                }
            });
            $html.find('#stochrsi_level_add').click(function () {
                require(["charts/indicators/stochrsi/stochrsi_level"], function (stochrsi_level) {
                    stochrsi_level.open(containerIDWithHash, function (levels) {
                        $.each(levels, function (ind, value) {
                            $(table.row.add([value.level, '<div style="background-color: ' + value.stroke + ';width:100%;height:20px;"></div>', value.strokeWidth,
                                '<div style="width:50px;overflow:hidden;"><img src="images/dashstyle/' + value.dashStyle + '.svg" /></div>']).draw().node())
                                .data("level", value)
                                .on('click', function () {
                                    $(this).toggleClass('selected');
                                });
                        });
                    });
                });
            });


            $html.dialog({
                autoOpen: false,
                resizable: false,
                width: 350,
                modal: true,
                my: 'center',
                at: 'center',
                of: window,
                dialogClass: 'stochrsi-ui-dialog',
                buttons: [
                    {
                        text: "OK",
                        click: function () {

                            if (!isNumericBetween($html.find(".stochrsi_input_width_for_period").val(),
                                            parseInt($html.find(".stochrsi_input_width_for_period").attr("min")),
                                            parseInt($html.find(".stochrsi_input_width_for_period").attr("max")))) {
                                require(["jquery", "jquery-growl"], function ($) {
                                    $.growl.error({
                                        message: "Only numbers between " + $html.find(".stochrsi_input_width_for_period").attr("min")
                                                + " to " + $html.find(".stochrsi_input_width_for_period").attr("max")
                                                + " is allowed for " + $html.find(".stochrsi_input_width_for_period").closest('tr').find('td:first').text() + "!"
                                    });
                                });
                                return;
                            }

                                var levels = [];
                                $.each(table.rows().nodes(), function () {
                                    var data = $(this).data('level');
                                    if (data) {
                                        levels.push({
                                            color: data.stroke,
                                            dashStyle: data.dashStyle,
                                            width: data.strokeWidth,
                                            value: data.level,
                                            label: {
                                                text: data.level
                                            }
                                        });
                                    }
                                });
                                var options = {
                                    period: parseInt($html.find(".stochrsi_input_width_for_period").val()),
                                    stroke: defaultStrokeColor,
                                    strokeWidth: parseInt($html.find("#stochrsi_strokeWidth").val()),
                                    dashStyle: selectedDashStyle,
                                    appliedTo: parseInt($html.find("#stochrsi_appliedTo").val()),
                                    levels: levels
                                };
                                //Add STOCHRSI for the main series
                                $($(".stochrsi").data('refererChartID')).highcharts().series[0].addIndicator('stochrsi', options);

                            closeDialog.call($html);
                        }
                    },
                    {
                        text: "Cancel",
                        click: function () {
                            closeDialog.call(this);
                        }
                    }
                ]
            });
            $html.find('select').selectmenu();

            if (typeof _callback == "function") {
                _callback(containerIDWithHash);
            }

        });

    }

    return {

        open: function (containerIDWithHash) {

            if ($(".stochrsi").length == 0) {
                init(containerIDWithHash, this.open);
                return;
            }

            $(".stochrsi").data('refererChartID', containerIDWithHash).dialog("open");

        }

    };

});
