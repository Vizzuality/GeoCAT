    
    head(function(){
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
              '<a onclick="downloadRLA(\'csv\');changeApplicationTo()" class="export">Download CSV</a>' +
            '</div>' +
            '<div class="block last">' +
              '<p>Structured XML file for geographic data</p>' +
              '<a onclick="downloadRLA(\'kml\');changeApplicationTo()" class="export">Download KML</a>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- CSV error window -->' +
        '<div id="csv_error">' +
          '<a onclick="changeApplicationTo()" class="close">X</a>' +
          '<h3>There are errors in your uploaded csv file</h3>' +
          '<ul></ul>' +
          '<span>' +
            '<a onclick="changeApplicationTo()" class="cancel">Cancel</a>' +
            '<a class="continue">continue</a>' +
          '</span>' +
        '</div>' +

        '<!-- Close without save/download -->' +
        '<div id="close_save">' +
          '<a onclick="changeApplicationTo()" class="close">X</a>' +
          '<p>You are going to leave the editor and lose<br/>' +
          'your changes. Do you want to save them?</p>' +
          '<p class="bottom"><a onclick="window.location.href='/'" class="cancel">Close without saving</a><a onclick="$(\'#close_save\').fadeOut(); downloadRLA(\'rla\')" class="download"></a>' +
          '</p>' +
        '</div>' +

        '<!-- Wellcome window -->' +
        '<div id="wellcome">' +
          '<a onclick="$(\'#wellcome\').fadeOut()" class="close">X</a>' +
          '<p>Start your new assessment by...</p>' +

          '<div class="blocks">' +
            '<div class="block">' +
              '<label>Import data from<br/>' +
              'online source</label>' +
              '<a class="import_data" onclick="$(\'div.center-tool div.right a.add\').trigger(\'click\');">Import data</a>' +
            '</div>' +
            '<div class="block">' +
              '<label>Upload your existing<br/>' +
              'data (CSV, RLAT)</label>' +
              '<a class="upload_data" onclick="$(\'div.center-tool div.right a.add\').trigger(\'click\');">Upload data</a>' +
            '</div>' +
            '<div class="block last">' +
              '<label>Add / Edit points<br/>' +
              'just in the map</label>' +
              '<a class="add_points" onclick="$(\'div.center-tool div.left a.add\').trigger(\'click\');">Add points</a>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Mamufas map -->' +
        '<div id="mamufas_map">' +
          '<div id="loader_map">' +
            '<img src="/images/editor/map_loader.gif" alt="Map loader" />' +
          '</div>' +
          '<div id="import_success">' +
            '<img src="/images/editor/import_done.png" alt="Import done" />' +
          '</div>' +
        '</div>' +

        '<!-- Help state -->' +
        '<div class="help_container" onclick="changeApplicationTo()">' +
          '<img src="/images/editor/help_bkg.png" class="help"/>' +
          '<span class="do"></span>' +
          '<span class="tool"></span>' +
          '<span class="download"></span>' +
          '<span id="analysis_help"></span>' +
        '</div>'+
        
        
        '<!-- Layers window -->' +
        '<div id="layer_window">' +
          '<h3>LAYERS OVERLAY</h3>' +
          '<ul></ul>' +
          '<form action="javascript:void alert(\'jamon\');">' +
            '<input type="text" value="Add source from URL..." />' +
            '<input type="submit" value="Import" />' +
          '</form>' +
        '</div>'
        );
    });
    