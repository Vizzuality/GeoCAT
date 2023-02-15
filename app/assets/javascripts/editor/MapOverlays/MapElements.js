
    $(document).ready(function() {
      $('div.center-map').append(
        '<div class="search_place">' +
          '<p>go to</p>' +
          '<form action="javascript: void searchPlace()">' +
            '<input type="text" id="search_location_input" value="" />' +
            '<input type="submit" value="" />' +
          '</form>' +
        '</div>' +

        '<!-- Search not found -->' +
        '<span class="search_not_found">' +
          '<p>Ops! It looks like your location doesn’t exists</p>' +
        '</span>' +

        '<!-- Export window -->' +
        '<div id="export_window">' +
          '<a onclick="changeApplicationTo()" class="close">X</a>' +
          '<h3>Download the species data</h3>' +
          '<div class="blocks">' +
            '<div class="block">' +
              '<p>Plain text, comma separated values</p>' +
              '<a onclick="downloadGeoCAT(\'csv\');changeApplicationTo()" class="export">Download CSV</a>' +
            '</div>' +
            '<div class="block">' +
              '<p>Structured XML file for geographic data</p>' +
              '<a onclick="downloadGeoCAT(\'kml\');changeApplicationTo()" class="export">Download KML</a>' +
            '</div>' +
            '<div class="block last">' +
              '<p>IUCN Red List CSV file</p>' +
              '<a onclick="downloadGeoCAT(\'sis\');changeApplicationTo()" class="export">Download SIS</a>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Close without save/download -->' +
        '<div id="close_save">' +
          '<a onclick="changeApplicationTo()" class="close">X</a>' +
          '<p>You are going to leave the editor and lose<br/>' +
          'your changes. Do you want to save them?</p>' +
          '<p class="bottom"><a onclick="window.location.href=\'/\'" class="cancel">Close without saving</a><a onclick="$(\'#close_save\').fadeOut(); downloadGeoCAT(\'geocat\')" class="download">SAVE PROJECT</a>' +
          '</p>' +
        '</div>' +

        '<!-- Mamufas map -->' +
        '<div id="mamufas_map">' +
          '<div id="loader_map">' +
            '<img src="editor/map_loader.gif" alt="Map loader" />' +
          '</div>' +
          '<div id="import_success">' +
            '<img src="editor/import_done.png" alt="Import done" />' +
          '</div>' +
        '</div>' +

        '<!-- Help state -->' +
        '<div class="help_container" onclick="changeApplicationTo()">' +
          '<img src="editor/help_bkg.png" class="help"/>' +
          '<span class="do"></span>' +
          '<span class="tool"></span>' +
          '<span class="download"></span>' +
          '<span id="analysis_help"></span>' +
        '</div>'
        );
    });

