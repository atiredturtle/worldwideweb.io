// Globals
var url = "https://raw.githubusercontent.com/atiredturtle/code1161base/master/Project/Web_Scrapped_websites.csv";
var MIN_TAIL = 10
var MAX_TAIL = 400

// ----------------- DATA DICTS -----------------
// Name: safetyDict
// Key: Child safety rating
// Value: Number of websites with this rating
var safetyDict = {};

// Name: trustDict
// Key: Trustworthiness rating
// Value: Number of websites with this rating
var trustDict = {};

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
$(document).ready(function(){prepareCharts();});

function prepareCharts(){
    // parse data
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {  
            processData(results.data); // populate dicts with CSV data
            drawChart(safetyDict, "safetyChart", "Child safety rating of website");
            drawChart(trustDict, "trustChart", "Trustworthiness rating of webiste");
        }
    });
}
    
// takes parsed CSV and populates the dicts accordingly
function processData(d){
    for (var i = 0; i < d.length; i++){
        var item = d[i];
        var sRating = item.Child_Safety;
        var tRating = item.Trustworthiness;

        (sRating in safetyDict) ? safetyDict[sRating] += 1 
                                : safetyDict[sRating] = 1;
        
        (tRating in trustDict)  ? trustDict[tRating] += 1 
                                : trustDict[tRating] = 1;
    }
}


function drawChart(d, ctx, label){
    var my_keys = ["Excellent", "Good", "Unsatisfactory", "Poor", "Very poor", "Unknown"];
    var my_data = [];
    var my_colors = ['rgba(0,  255,   0, 0.6)', 
                    'rgba(192, 255,  96, 0.6)', 
                    'rgba(255, 246, 104, 0.6)', 
                    'rgba(232, 101,  12, 0.6)', 
                    'rgba(255,   0,   0, 0.6)',
                    'rgba(100, 100, 100, 0.6)'];    
    
    // adds data to array
    for (var i = 0; i < my_keys.length; i++) {
        my_data.push(d[my_keys[i]]);
    }
    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: my_keys,
            datasets: [{
                label: label,
                data: my_data,
                backgroundColor: my_colors,
            }]
        },
        backgroundColor: my_colors,
    });
}



