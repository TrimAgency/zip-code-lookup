var cityStateZipHandler = function(cityField, stateField, zipField){
    var countryValue = "US";
    var cityValue;
    var stateValue;
    var zipValue;
    var citiesValue;
    var cityId = cityField[0].id
    var stateId = stateField[0].id
    var modelName = (cityId.split("_"))[0]
    // need to use the app's unique Google API key
    var myGoogleApiKey = "(put your Google API key here)"

    // when the user clicks off of the zip field:
    $(zipField).keyup(function(){
        if($(this).val().length == 5){
        var zipValue = $(this).val();
        var cityValue = "";
        var stateValue = "";
        zipLookup(zipValue); 
        }
    });

    function zipLookup(zipValue){
        $.ajax({
            url: "https://maps.googleapis.com/maps/api/geocode/json?region="+countryValue+"&address="+zipValue+"&key="+myGoogleApiKey,
            method: "GET",
            dataType: "json",
        }).done(onLookupSuccess).fail(onLookupFail);
    }

    function onLookupSuccess(response){
        getCityAndState(response);
        setState(stateValue);
        setCity(cityValue);
    }

    function getCityAndState(response){
        var address_components = response.results[0].address_components;

        $.each(address_components, function(index, component){
            var types = component.types;
            $.each(types, function(index, type){
              if(type == "locality") {
                cityValue = component.long_name;
              }
              if(type == "administrative_area_level_1") {
                stateValue = component.short_name;
              }
            });
        });
        // if multiple cities returned, use them instead of the primary city
        citiesValue = response.results[0].postcode_localities;
    }

    function setState(){
        $("#"+stateId).val(stateValue);
    }

    function setCity(cityValue){
        if(citiesValue === undefined){
            // if already entered a zip w/multi-city response, and now changing
            //   back to a zip with just one city, remove the dropdown
            if($("#"+cityId).hasClass("form-control form-select")) {
                $("#city_wrap").removeClass("dropdown");
                $("#"+cityId).remove();
                var $input = $(document.createElement("input"));
                $input.type = "text";
                $input.attr("id",cityId);
                $input.attr("name",modelName+"[city]");
                $("#city_wrap").html($input);
                $("#"+cityId).addClass("string required form-control");
            }
            $("#"+cityId).val(cityValue);
        } else {
            formatCityCollection(citiesValue);
        }
    }

    function formatCityCollection(citiesValue){
        // turn mult-city response into a dropdown
        var $select = $(document.createElement("select"));
        $($select).append(
                '<option value="">- select a city -</option'
                );
        $.each(citiesValue, function(index, locality){
          var $option = $(document.createElement("option"));
          $option.html(locality);
          $option.attr("value",locality);
          $select.append($option);
        });
        $($select).append(
                '<option value="- enter a city -">- enter a city -</option'
                );
        $("#"+cityId).remove();
        $select.attr("id",cityId);
        $select.attr("name",modelName+"[city]");
        $("#city_wrap").addClass("dropdown");
        $("#city_wrap").html($select);
        $("#"+cityId).addClass("form-control form-select");
    }

    function onLookupFail(){}

    // if city is changed and is still a drop-down, set it back to 
    //   text field so the user can override any selections
    // city object gets removed, so watching for change
    //   on parent object to reset dropdown back to text field
    $("#city_wrap").on('change',cityField,function(){
        if($("#"+cityId).hasClass("form-control form-select")) {
            cityValue = $("#"+cityId).val();    
            $("#city_wrap").removeClass("dropdown");
            $("#"+cityId).remove();
            var $input = $(document.createElement("input"));
            $input.type = "text";
            $input.attr("id",cityId);
            $input.attr("name",modelName+"[city]");
            $("#city_wrap").html($input);
            $("#"+cityId).addClass("string required form-control");
            $("#"+cityId).val(cityValue);
            // if user wants to enter their city after a multi-city
            //   response, set the value to "", and add a placeholder,
            //   and if not, move to the state field
            if($("#"+cityId).val() === "- enter a city -"){
                $("#"+cityId).attr("placeholder", "enter a city").val("");
            } else {
                $("#"+stateId).focus();
            }
        }
    });
}

// Handler to use the above method

$(document).ready(function(){
    if(document.getElementById("new_property")){
        var zipHandler = new cityStateZipHandler($("#property_city"), $("#property_state"), $("#property_zip_code"));
    }

    if($("[id^=edit_property_]").length !== 0){
        var zipHandler = new cityStateZipHandler($("#property_city"), $("#property_state"), $("#property_zip_code"));
    }

   if(document.getElementById("new_user") && document.getElementById("user_zip_code")){
       var zipHandler = new cityStateZipHandler($("#user_city"), $("#user_state"), $("#user_zip_code"));
   }

   if(document.getElementById("edit_user")){
       var zipHandler = new cityStateZipHandler($("#user_city"), $("#user_state"), $("#user_zip_code"));
   }

   if(document.getElementById("new_lead")){
       var zipHandler = new cityStateZipHandler($("#lead_city"), $("#lead_state"), $("#lead_zip_code"));
   }
   if(document.getElementById("new_background_check")){
       var zipHandler = new cityStateZipHandler($("#tenant_city"), $("#tenant_state"), $("#tenant_zip_code"));
   }
})

