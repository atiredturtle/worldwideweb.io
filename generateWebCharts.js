// Globals
var url = "https://raw.githubusercontent.com/atiredturtle/code1161base/master/Project/Web_Scrapped_websites.csv";
var MIN_TAIL = 10
var MAX_TAIL = 400

var MAX_TOP = 50;
var myChart;

// ----------------- DATA DICTS -----------------
// Name: popDict
// Key: Site Name
// Value: Array counting popularity, indexed by popularity value. 
//        - E.g. if the 3st item is 10, then 10 countries have the site as their 3rd favourite
var popDict = {};

// ----------------- HELPER FUNCTIONS -----------------
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomColor(){
    var r = getRandomInt(0, 255);
    var g = getRandomInt(0, 255);
    var b = getRandomInt(0, 255);
    return 'rgba('+r+', '+g+', '+b+', 0.6)';
}

// ----------------- CODE -----------------
// calls prepareCharts() when document is ready
$(document).ready(function(){ prepareCharts();});

function prepareCharts(){
    // parse data
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {  
            processData(results.data); // populate dicts with CSV data
            drawPopChart();
            prepareSliders(); // initialise sliders
        }
    });
}
    
// takes parsed CSV and populates the dicts accordingly
function processData(d){
    var tempSites = [];
    for (var i = 0; i < d.length; i++){
        var item = d[i];
        var country = item.country;
        var website = item.Website;

        // for website popularity (dict value is number of countries that have it as a fav)
        if (website in popDict){
            popDict[website][item.Country_Rank] += 1
        } else {
            popDict[website] =  new Array(51).fill(0); // crate new empty array
            popDict[website][item.Country_Rank] = 1;
        }
    }
}


function drawPopChart(top=MAX_TOP, tail=MIN_TAIL){
    // reduce dictionary
    var d = {}; 
    for (var key in popDict){
        // counts number of popularity votes up to the 'top'th popularity
        // e.g if top = 4, only count the popularity from 1-4
        var occ = 0;
        for (var i = 1; i <= top; i++){
            if (popDict[key][i] !== undefined) occ += popDict[key][i];
        }
        d[key] = occ;
    }

    // destroy old chart (if exists)
    if (myChart !== undefined) {myChart.destroy();}
    var my_keys = [];
    var my_data = [];
    var my_colors = [];

    var sortedKeys = Object.keys(d).sort(function(a, b) {return d[b] - d[a];});

    for (var i = 0; i < tail ; i++) {
        var key = sortedKeys[i];
        my_keys.push(key);
        my_colors.push(getRandomColor());
        my_data.push(d[key]);
    }

    var ctx = "popularityChart";
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: my_keys,
            datasets: [{
                label: '# popular votes from 1-' + parseInt(top),
                data: my_data,
                backgroundColor: my_colors,
            }]
        },
    });
}


// Sets up the sliders 
function prepareSliders(){
    // load sliders
    var itemSlider = document.getElementById('itemSlider');
    itemSlider.style.width = '400px';
    itemSlider.style.margin = '0 auto 30px';
    
    noUiSlider.create(itemSlider, {
        start: MIN_TAIL,
        connect: [true, false],
        step: 1,
        tooltips: true,
        range: {
            'min': MIN_TAIL,
            'max': MAX_TAIL
        }, pips: { // Show a scale with the slider
            mode: 'range',
            stepped: true,
            density: 10
        }
    });
    itemSlider.noUiSlider.on('change', updatePopChart);

    var popularitySlider = document.getElementById('popularitySlider');
    popularitySlider.style.width = '400px';
    popularitySlider.style.margin = '0 auto 30px';
    noUiSlider.create(popularitySlider, {
        start: 50,
        connect: [true, false],
        step: 1,
        tooltips: true,
        range: {
            'min': 1,
            'max': MAX_TOP
        }, pips: { // Show a scale with the slider
            mode: 'range',
            stepped: true,
            density: 10
        }
    });
    popularitySlider.noUiSlider.on('change', updatePopChart);
    function updatePopChart(){ 
        var tail = itemSlider.noUiSlider.get();
        var top  = popularitySlider.noUiSlider.get();
        drawPopChart(top, tail); 
    }
}


