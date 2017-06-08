// GLOBALS
var url = "https://raw.githubusercontent.com/atiredturtle/code1161base/master/Project/Web_Scrapped_websites.csv";
var allSitesPrompt = []; // used for autocomplete prompts
var allSites = []; // list of all sites


// ----------------- DATA DICTS -----------------
// Name: popDict
// Key: Country name
// Value: Array of websites ordered by popularity
var popDict = {};

// Name: webPopDict
// Key: Website name
// Value: Count of countries that have the website in their top 50
var webPopDict = {};

// ----------------- CODE -----------------

// Parses the csv at the url provided
Papa.parse(url, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {  
        console.log("CSV Loaded!");
        processData(results.data);
        google.charts.load('current', {'packages':['table', 'geochart']});
        google.charts.setOnLoadCallback(drawRegionsMap);
        google.charts.setOnLoadCallback(drawSiteList);
    }
});

// processes the csv data and fills up the dicts
function processData(d){
    allSites = [];
    for (var i = 0; i < d.length; i++){
        var country = d[i].country;
        var website = d[i].Website;
        // if we want to count region specific URLS e.g. www.Agoogle.com.au
        // website = website.replace(/\.com\..*/, '.com');
        // website = website.replace(/\.co\..*/, '.co');

        // for region data (popDict value is ordered array of most popular sites)
        (country in popDict) ? popDict[country].push(website) 
                             : popDict[country] = new Array();

        // for Autocomplete
        allSites.push(website);

        // for website popularity (dict value is number of countries that have it as a fav)
        (website in webPopDict) ? webPopDict[website] += 1  
                                : webPopDict[website] = 1;
    }

    // make tempSites unique
    allSites = allSites.filter(function(elem, index, self) {return index == self.indexOf(elem);});

    // place websites in allSites list as objects (the search prompt uses this format)
    for (var i = 0; i < allSites.length; i++){
        allSitesPrompt.push({ value: allSites[i] });
    }
}


function drawRegionsMap(siteSearched="www.google.com") {
    // Creates array out of dictionary (for dataTable)
    var arr = [];
    // Header for data
    arr.push(['Country', 'Popularity rank of '+ siteSearched]); 
    for (var country in popDict) {
        // gets the popularity of the website within the country 
        var popularity = popDict[country].indexOf(siteSearched) + 1;
        // if not a favourite in the country, give null value
        if (popularity == 0) popularity = null; 
        arr.push([country, popularity]);
    }

    var data = google.visualization.arrayToDataTable(arr);

    // sets up the geochart
    var chart = new google.visualization.GeoChart($('#regions_div')[0]);
    var options = {
        legend: 'none',
        sizeAxis: { maxValue: 50 },
        colorAxis: { colors: ['#00FF00', '#FF0000'] },
        defaultColor:'#EEEEEE', //used for null values
        interpolateNulls: true,
    };
    
    // add EventListener to chart to handle clicks
    google.visualization.events.addListener(chart, 'select', function(){
        var selectedItem = chart.getSelection()[0]; // gets the name of the country
        if (selectedItem) {
            var country = data.getValue(selectedItem.row, 0);
            // calls up the modal
            $("#countryModal").modal();
            // modifies the modal title to be the country
            $("#modalHead").text(country);

            // creates a list of the top 10 websites
            var listHTML = "<ol>"
            for (var i = 0; i < 10; i++){
                listHTML += "<li>"+popDict[country][i]+"</li>";
            }
            listHTML+= "</ol";
            $("#modalBody").html(listHTML);
        }
    });    

    // draw the chart
    chart.draw(data, options);

    // update the current website text 
    $('#currentWebsite').text(siteSearched);
}

// Creates the list of websites on the right side
function drawSiteList(){
    // Creates array out of dictionary (for dataTable)
    var arr = [];
    // Header for Site List table
    arr.push(['Website', '# countries in top 50']); 
    // place webPopDict into array to be converted later
    for (var key in webPopDict) arr.push([ key, webPopDict[key] ]);

    var chart = new google.visualization.Table($('#site_div')[0]);

    var data = google.visualization.arrayToDataTable(arr);    

    // add EventListener to handle clicks on table
    google.visualization.events.addListener(chart, 'select', function(){
        var selectedItem = chart.getSelection()[0];
        drawRegionsMap( data.getValue(selectedItem.row, 0)); 
    });    

    var options = { sortColumn: 1, sortAscending: false };

    // draw chart
    chart.draw(data, options);
}


// redraws map when search is changed
$('#websiteSearch').change(function(){
    siteSearched = $('#websiteSearch').val();
    // only redraw map if the website is in the list of all websites
    if (siteSearched in allSites) drawRegionsMap(siteSearched);
});

// Handles the autocomplete (uses library)
$("#websiteSearch").autocomplete({
    lookup: allSitesPrompt,
    onSelect: function (suggestion) {
        siteSearched = $('#websiteSearch').val();
        drawRegionsMap(siteSearched);
    }
});
