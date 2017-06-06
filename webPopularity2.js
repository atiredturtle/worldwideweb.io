// GLOBALS
var url = "https://raw.githubusercontent.com/atiredturtle/code1161base/master/Project/Web_Scrapped_websites.csv";
var NUM_FAVS = 5
var website_to_draw = "www.facebook.com"; // default
var CSVdata;
var dict = {};
var allSitesDict = {};
var allSites = []; // used for prompts

function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable(generateArray(dict, website_to_draw));

    var options = {
        tooltip: {
            isHtml: true
        },
        legend: 'none',
        sizeAxis:{
            maxValue: 50
        },
       // datalessRegionColor:'#000000',
        colorAxis: {
            colors: ['#00FF00', '#FF0000']
        },
        magnifyingGlass: {
            enable: true, 
            zoomFactor: 7.5
        }
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));


    // handles clicks on map
    function selectHandler(){
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            var country = data.getValue(selectedItem.row, 0);
            alert('The user selected ' + country);
        }
    } 

    // add EventListener to chart
    google.visualization.events.addListener(chart, 'select', selectHandler);    

    chart.draw(data, options);

    // displays the current website being drawn
    $('#currentWebsite').text(website_to_draw);
}



function drawChart(){
    function generateSiteArray(){
        var arr = [];
        var header = ['Website', '# countries in top 50'];
        arr.push(header);

        var d = allSitesDict;
        for (var key in d) {
            var subArr = [];
            subArr.push(key);
            // get number of 1sts
            // if (typeof d[key][1] === 'undefined'){
            //     subArr.push(0);
            // } else {
            //     subArr.push(d[key][1]);
            // }

            // get total occurances in top 50
            var occ = 0;
            for (var i = 1; i <= d[key].length; i++){
                if (typeof d[key][i] !== 'undefined'){
                    occ += d[key][i];
                }
            }
            subArr.push(occ);

            arr.push(subArr);
        }
        return arr;
    }

    var chart = new google.visualization.Table(document.getElementById('site_div'));

    var data = google.visualization.arrayToDataTable(generateSiteArray());    

    // handles clicks on table
    function selectHandler(){
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            website_to_draw = data.getValue(selectedItem.row, 0);
            drawRegionsMap();
        }
    } 

    // add EventListener to chart
    google.visualization.events.addListener(chart, 'select', selectHandler);    

    var options = {
        sortColumn: 1,
        sortAscending: false,
    };

    chart.draw(data, options);
}

Papa.parse(url, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {  
        console.log("CSV Loaded!");
        CSVdata = results;
        //console.log(CSVdata);
        processData(CSVdata.data);
        //generateArray(dict);
        //reduceDict(dict, 30);
        //console.log(dict);
        //drawChart(dict);
        google.charts.load('current', {'packages':['table', 'geochart']});
        google.charts.setOnLoadCallback(drawRegionsMap);
        google.charts.setOnLoadCallback(drawChart);
    }
});

$("#websiteSearch").autocomplete({
    lookup: allSites,
    onSelect: function (suggestion) {
        website_to_draw = $('#websiteSearch').val();
        drawRegionsMap();
    }
});

function processData(d){
    var tempSites = [];
    for (var i = 0; i < d.length; i++){
        var country = d[i].country;
        var website = d[i].Website;
        // if we want to count region specific URLS e.g. www.Agoogle.com.au
        // website = website.replace(/\.com\..*/, '.com');
        // website = website.replace(/\.co\..*/, '.co');

        // for region data (dict value is array of most popular sites)
        if (country in dict){
            dict[country].push(website);
        } else {
            dict[country] = [];
        }
        // for Autocomplete
        tempSites.push(website);

        // for website popularity (dict value is number of countries that have it as a fav)
        if (website in allSitesDict){
            if (d[i].Country_Rank in allSitesDict[website]){
                allSitesDict[website][d[i].Country_Rank] += 1;
            } else {
                allSitesDict[website][d[i].Country_Rank] = 1;
            }
        } else {
            allSitesDict[website] = [];
            allSitesDict[website][d[i].Country_Rank] = 1;
        }
    }

//    console.log(allSitesDict);


    // make tempSites unique
    tempSites = tempSites.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });

    // place websites in allSites list as object
    for (var i = 0; i < tempSites.length; i++){
        allSites.push({ value: tempSites[i] });
    }
}
 


function generateArray(d, searchSite){
    var arr = [];
    var header = ['Country', 'Popularity rank of '+ searchSite];
    
    arr.push(header);
    for (var key in d) {
        var subArr = [];
        subArr.push(key);
        for (var i = 0; i < d[key].length; i++){
            if (d[key][i] == searchSite){
                var popularity = i+1;
                subArr.push(popularity);
                arr.push(subArr);
            }
        }
    }
    return arr;
}

$('#websiteSearch').change(function(){
    website_to_draw = $('#websiteSearch').val();
    drawRegionsMap();
});