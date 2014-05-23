function show_result(msg) {
    var res = $.parseJSON(msg);
    var allMatches = res.matches;
    var groupsName = res.groupsName;

    // We clear previous results
    clearResults();

    if (allMatches && allMatches[0] != null)
    {
        var l = allMatches.length;

        // Match font color > green
        $("#match").css("color", "green")

        // Match groups
        if (l > 0)
        {
            var match = [];
            var matchGroupsTable = [];
            var index = 0;

            for (var i = 0; i < l; i++)
            {
                var matches = allMatches[i];
                var m = matches.length;

                match.push(matches[0]);
                for (var j = 1; j < m; j++)
                {
                    matchGroupsTable.push('<tr><td>'+(index++)+'</td><td>'+((groupsName[j-1] != "") ? groupsName[j-1] : "-")+'</td><td>'+escapeHTML(matches[j])+'</td></tr>');
                }
            }

            $("#match").html(escapeHTML(match.join(" ")))
            $('#matchGroupsTable > tbody:last').append(matchGroupsTable.join());
        }

    }
    else
    {
        $("#match").html("No match !")
        $("#match").css("color", "red")
    }
    //done(show_result(msg)).error(function(error) {
        //    $("#match").html(error.responseText)
        //    $("#match").css("color", "red")
        //});
}

function clearResults() {
    // Empty match groups table
    $("#matchGroupsTable tbody > tr").remove();

    $("#match").html("")
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

$(document).ready(function() {
    var w = new_web_sock(validate_url);
    function testRegex () {
        if($("#regexpInput").val().trim() == "" ||
        $("#testStringInput").val().trim() == "") {
            show_alert_by_id("set-alert-id-sans-blank", "Both regular expression and test string can not be blank");
            return;
        } else {
            if(typeof(w) === "undefined" || w.readyState !== ESTABLISHED)
                w = new_web_sock(validate_url);
            var form_data = new Object();
            form_data.msg_id="reg_form";
            form_data.regexp=$("#regexpInput").val();
            form_data.testString=$("#testStringInput").val();
            form_data.findAllSubmatch=$("#findAllSubmatchCheckbox").is(":checked");
            send_valite_data(w, JSON.stringify(form_data));
        }
    }

    function clear() {
        $("#regexpInput").val("");
        $("#testStringInput").val("");

        // Remove placeholder
        $("#regexpInput").attr("placeholder", "");
        $("#testStringInput").attr("placeholder", "");

        clearResults();
    }


    $("#clearAllFieldsButton").click(function() {
        clear();
        return false;
    });

    $("#sendRequest").click(function() {
        testRegex();
        return false;
    });
});
