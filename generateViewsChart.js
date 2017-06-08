// Globals
var url = "https://raw.githubusercontent.com/atiredturtle/code1161base/master/Project/Web_Scrapped_websites.csv";
var MIN_TAIL = 10
var MAX_TAIL = 400

var myChart;

// ----------------- DATA DICTS -----------------
// Name: viewsDict
// Key: Site Name
// Value: Average Daily Views
var viewsDict = {};

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
            drawViewsChart();
            prepareSliders(); // initialise sliders
        }
    });
}
    
// takes parsed CSV and populates the dicts accordingly
function processData(d){
    for (var i = 0; i < d.length; i++){
        var website = d[i].Website;

        // if the website hasn't been added
        if (!(website in viewsDict)){
            // strip all whitespaces
            numDailyVisitors = d[i].Avg_Daily_Visitors.replace(/\s/g,""); 
            // if the value is 'N/A' default to 0
            if (numDailyVisitors == 'N/A')  numDailyVisitors = 0;
            // convert to integer and add to viewsDict
            viewsDict[website] = parseInt(numDailyVisitors);
        } 
    }
}


function drawViewsChart(tail=MIN_TAIL){
    // reduce dictionary
    if (myChart !== undefined) {myChart.destroy();}
    var my_keys = [];
    var my_data = [];
    var my_colors = [];

    // sorts the keys via the values
    var sortedKeys = Object.keys(viewsDict).sort(function(a, b) {return viewsDict[b] - viewsDict[a];});

    for (var i = 0; i < tail ; i++) {
        var key = sortedKeys[i];
        my_keys.push(key);
        my_colors.push(getRandomColor());
        my_data.push(viewsDict[key]);
    }

    // create the chart
    var ctx = "viewsChart";
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: my_keys,
            datasets: [{
                label: '# avg daily views',
                data: my_data,
                backgroundColor: my_colors,
            }]
        }
    });
}

// initalises the slider (more can be added)
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
    itemSlider.noUiSlider.on('change', function(){
        var tail = itemSlider.noUiSlider.get();
	    drawViewsChart(tail); 
    });
}


