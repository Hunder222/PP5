//// DOM
const citizenshipChartElement = document.querySelector("#statsborgerskab")
const studieretningChartElement = document.querySelector("#studieretning")
const førstePrioritetChartElement = document.querySelector("#førstePrioritet")






//// charts
let citizenshipChart = new Chart(citizenshipChartElement, {
    data: {
        labels: ["DSa", "SAFs"],
        datasets: [
            // --- DATASET 1: foriegns ---
            {
                type: 'pie',
                label: 'Fordeling af udland',
                data: [20, 20, 15, 12, 10, 8, 6, 2], // Use the averages array directly here

                // Make the actual graph invisible
                borderColor: 'rgba(255, 41, 41, 1)',
                backgroundColor: 'rgba(255, 99, 99, 0.69)',
                pointRadius: 5,
                pointHoverRadius: 0,

                order: 0,

                // Configure labels specifically for this "Ghost" dataset
                datalabels: {
                    display: true,
                    align: 'top',     // Push text UP from the anchor
                    anchor: 'center', // Lock anchor to the exact data point (the average)
                    offset: 0,       // Space between the invisible point (center of red dot) and text

                    color: 'red',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            // --- DATASET 2: Danish and foriegn ---
            {
                type: 'pie',
                label: 'Dansk og udland',
                data: [55, 45],
                backgroundColor: 'rgba(104, 99, 255, 0.5)',
                borderColor: 'rgba(99, 138, 255, 1)',
                borderWidth: 1,
                outlierColor: '#999999',

                order: 10,

                // DISABLE labels for the box itself
                datalabels: {
                    display: false
                }
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: ''
            },
            tooltip: {
                mode: 'index',
                intersect: true,
                // Optional: Hide the tooltip for the ghost line if you want
                filter: function (tooltipItem) {
                    return tooltipItem.datasetIndex === 0;
                }
            },
            legend: {
                display: true
            }
        }
    }
});


citizenshipChart.update()






let studieretningChart = new Chart(studieretningChartElement, {
    type: 'bar',
    data: {
        labels: ["asfs"],
        datasets: [
            {
                label: 'Mand',
                data: [54],
                backgroundColor: '#36a2eb',
            }
        ]
    }
});

studieretningChart.update()






//// queries







//////// START__QUERIES ////////

function getCountFromDenmarkOrAbroad() {
    const pipeline = [
        {
            $group: {
                _id: {
                    $cond: {
                        if: {$eq: ["$Statsborgerskab", "Danmark"]},
                        then: "Danmark",
                        else: "Udlandet"
                    }
                },
                Total: {$sum: 1}
            }
        }
    ];

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryResult.all ? queryResult.all() : queryResult;

    console.log(result)

}

getCountFromDenmarkOrAbroad()


function getCountFieldOfStudy() {
    const pipeline = [
        {
            $group: {
                _id: "$EKSAMENSTYPE_NAVN",
                antal: { $sum: 1 }
            }
        },

        {
            $sort: { antal: -1 }
        }
    ]
    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryResult.all ? queryResult.all() : queryResult;

    console.log(result)
}
getCountFieldOfStudy()



function getCountFirstPriority() {
    const pipeline = [
        {
            $group: {
                _id: "$INSTITUTIONSAKT_BETEGNELSE",

                antal_J: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$Søgt som prioritet 1", "J"] },
                            then: 1,
                            else: 0
                        }
                    }
                },

                antal_N: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$Søgt som prioritet 1", "N"] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            }
        }
    ]
    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryResult.all ? queryResult.all() : queryResult;

    console.log(result)
}
getCountFirstPriority()

//////// END__QUERIES ////////
