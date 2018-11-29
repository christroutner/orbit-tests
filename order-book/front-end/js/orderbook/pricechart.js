/*
  This library contains code for managing the price chart.
*/

"use strict"

// Chart variables.
const prices = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,];
const labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
let cfg;
let ctx;
let chart;


// Update the price every 2 seconds.
const timer = setInterval(function() {
  updatePrice();
}, 2000);


// Update the price array. Keeps the length of the array fixed.
async function updatePrice() {
  try {
    //debugger;

    const newPrice = await getPrice();

    // Manipulate the arrays to ensure there are always a fixed number of data points.
    prices.shift();
    prices.push(newPrice);
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(newPrice);

    // Update the chart.
    chart.update();

  } catch(err) {
    //console.error(`Error in updatePrice(): `, err);
  }
}


// Chart configuration settings.
function configChart() {
  const cfg = {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [{
				label: 'RWLK - Random Walk Price',
				data: prices,
				type: 'line',
				pointRadius: 0,
				fill: false,
				lineTension: 0,
				borderWidth: 2
			}]
		},
		options: {
			scales: {
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Closing price ($)'
					}
				}]
			}
		}
	};

  return cfg;
}
