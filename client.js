// DOM
const testField = document.querySelector("#testField");
const genderChartElement = document.querySelector("#genderChart")
const ageChartElement = document.querySelector("#ageChart")
const quotaChartElement = document.querySelector("#quotaChart")


console.log(EKdataset[0]);


//////// START__CHARTJS ////////


const exampleData = {
    general: {
        averageQuota: 5.5,
        avgQuotaM: 5.1,
        avgQuotaF: 5.9,
        genders: {
            male: [57, 51, 61, 59, 55],
            female: [43, 49, 39, 41, 45]
        }
    },
    educations: {
        names: ['ITAR', 'LOREM', 'IPSUM', 'DOLOR', 'AMET'],
        ages: [
            [23, 23, 34, 19, 35, 22, 21, 22, 56, 22, 24],
            [23, 23, 34, 19, 35, 22, 21, 22, 22, 22, 24],
            [23, 23, 34, 33, 35, 22, 21, 22, 22, 22, 24],
            [23, 23, 34, 21, 35, 22, 21, 22, 44, 22, 24],
            [23, 23, 34, 18, 35, 22, 21, 22, 38, 22, 24],
            [23, 23, 34, 37, 35, 22, 32, 22, 30, 22, 24]
        ],
        agesAvg: [25, 23, 22, 28, 31],
        quotasAvg: [5.4, 4.5, 5.1, 6.1, 5.7]
    }
}

Chart.register(ChartDataLabels)


// gender chart
let genderChart = new Chart(genderChartElement, {
    type: 'bar',
    data: {
        labels: exampleData.educations.names,
        datasets: [
            {
                label: 'Mand',
                data: exampleData.general.genders.male,
                backgroundColor: '#36a2eb',
            },
            {
                label: 'Kvinde',
                data: exampleData.general.genders.female,
                backgroundColor: '#ff6384',
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            // 1. Clean up the Tooltip (the box when you hover)
            tooltip: {
                callbacks: {
                    label: function (context) {
                        // Round to 1 decimal place for the tooltip
                        let value = context.raw;
                        return context.dataset.label + ": " + value.toFixed(1) + "%";
                    }
                }
            },
            // 2. Clean up the Labels (the text on the bar)
            datalabels: {
                color: 'white',
                font: {weight: 'bold'},
                // Round to 1 decimal place, e.g., "33.3%"
                formatter: (value) => {
                    return value.toFixed(1) + '%';
                }
            }
        },
        scales: {
            x: {stacked: true},
            y: {
                stacked: true,
                min: 0,
                suggestedMax: 100,
            }
        }
    }
});

genderChart.update()


let ageChart = new Chart(ageChartElement, {
    type: 'boxplot',
    data: {
        // Labels for the X-axis
        labels: exampleData.educations.names,
        datasets: [{
            label: 'Alder i uddannelser',
            data: exampleData.educations.ages,
            backgroundColor: 'rgba(104, 99, 255, 0.5)',
            borderColor: 'rgba(99, 138, 255, 1)',
            borderWidth: 1,
            outlierColor: '#999999',
            outlierOpacity: 1,
            padding: 10
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Chart.js Box Plot Example'
            },
            tooltip: {
                // The plugin has its own tooltip logic built-in
                mode: 'index',
                intersect: false
            },
            datalabels: {
                display: true,

                formatter: function (value, context) {
                    // context.dataIndex is 0, 1, 2...
                    const ageAvg = exampleData.educations.agesAvg[context.dataIndex]
                    console.log(value);


                    return `Avg: ${ageAvg}`;
                },

                // Optional: Styling to position the label nicely
                color: 'black',
                font: {
                    weight: 'bold'
                },
                anchor: 'end', // Position anchor at the top of the box/whisker
                align: 'top',  // Move the text up away from the anchor
                offset: 4      // Add a little pixel spacing
            }
        }
    }
});

ageChart.update()


let quotaChart = new Chart(quotaChartElement, {
    type: 'bar',
    data: {
        // Labels for the X-axis
        labels: exampleData.educations.names,
        datasets: [{
            label: 'Kvotienter i uddannelser',
            data: exampleData.educations.quotasAvg,
            backgroundColor: 'rgba(104, 99, 255, 0.5)',
            borderColor: 'rgba(99, 138, 255, 1)',
            borderWidth: 1,
            outlierColor: '#999999',
            outlierOpacity: 1,
            padding: 10
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Chart.js Box Plot Example'
            },
            tooltip: {
                // The plugin has its own tooltip logic built-in
                mode: 'index',
                intersect: false
            },
            datalabels: {
                display: true,

                formatter: function (value, context) {
                    // context.dataIndex is 0, 1, 2...
                    const ageAvg = exampleData.educations.agesAvg[context.dataIndex]
                    console.log(value);


                    return `Avg: ${ageAvg}`;
                },

                // Optional: Styling to position the label nicely
                color: 'black',
                font: {
                    weight: 'bold'
                },
                anchor: 'end', // Position anchor at the top of the box/whisker
                align: 'top',  // Move the text up away from the anchor
                offset: 4      // Add a little pixel spacing
            }
        }
    }
});


//////// END__CHARTJS ////////
//////// START___LEAFLET ////////


// map init and propertiees
var map = L.map('leafletMapDK').setView([56.2, 10.5], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
})//.addTo(map);

// CartoDB Voyager (No maritime borders, cleaner look)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);


// add EK schools to map
function mapEkSchools() {
    const EKschools = [
        {
            name: "EK Guldbergsgade",
            latlng: [55.69149690984243, 12.555008402914718]
        },
        {
            name: "EK Landemærket",
            latlng: [55.68202742413432, 12.576277748303877]
        },
        {
            name: "EK Lygten",
            latlng: [55.706369426829156, 12.539137981532795]
        },
        {
            name: "EK Nansensgade",
            latlng: [55.68192028780662, 12.562680082210507]
        },
        {
            name: "EK Prinsesse Charlottes Gade",
            latlng: [55.6944551895993, 12.550846762451158]
        }
    ]

    EKschools.forEach(school => {
        L.circle(school.latlng, {
            color: "white", // stroke color
            opacity: 0.5, // stroke opacity
            fillColor: 'blue', // fill color
            fillOpacity: 0.3, // fill opacity
            radius: 250 // radius in meters 
        }).bindTooltip(
            `<b>${school.name}</b>`
        ).addTo(map);
    });
}


// Build a lookup map from City -> Municipality
function createCityLookup(municipalityData) {
    const lookup = new Map();

    municipalityData.forEach(entry => {
        const kommune = entry.Kommune;
        if (entry.Byer && Array.isArray(entry.Byer)) {
            entry.Byer.forEach(city => {
                // Store lowercase for case-insensitive matching
                lookup.set(city.trim().toLowerCase(), kommune);
            });
        }
    });
    return lookup;
}


// Process the dataset to get counts per municipality
function calculateMunicipalityStats(userEntries, municipalityMappingJson) {
    const cityToMunicipality = createCityLookup(municipalityMappingJson);
    const counts = {};
    let maxCount = 0;

    // Initialize counts for all known municipalities to 0 (optional, but good for completeness)
    municipalityMappingJson.forEach(m => {
        counts[m.Kommune] = 0;
    });

    // Iterate through the user dataset
    for (const entry of userEntries) {
        const cityRaw = entry["Bopæl_POSTDISTRIKT"];

        if (!cityRaw) continue; // Skip empty entries

        const cityClean = cityRaw.trim().toLowerCase();

        // Find which municipality this city belongs to
        const municipalityName = cityToMunicipality.get(cityClean);

        if (municipalityName) {
            counts[municipalityName] = (counts[municipalityName] || 0) + 1;

            // Keep track of the highest number for the color scale
            if (counts[municipalityName] > maxCount) {
                maxCount = counts[municipalityName];
            }
        }
    }

    return {counts, maxCount};
}


// 3. Color Generator Function
function getHeatmapColor(count, max) {
    // 1. GREY for zero entries
    if (count === 0) {
        return 'rgba(12,12,12,0.05)'; // Light Grey
    }

    // 2. Heatmap Scale (White -> Red)
    // Calculate intensity (0.0 to 1.0)
    const intensity = count / max;
    // We scale opacity from 0.3 to 1.0 based on intensity

    const opacity = 0.1 + (intensity * 0.7);
    return `rgba(220, 20, 60, ${opacity})`; // Crimson Red with calculated opacity
}


function mapMunicipalitiesFromDataset(datasetToVisualize) {
    // Fetch ALL necessary data
    fetch('https://raw.githubusercontent.com/magnuslarsen/geoJSON-Danish-municipalities/master/municipalities/municipalities.geojson')
        .then(r => r.json())
        .then(geoJsonData => {

            console.log("GeoJSON loaded. Processing stats...");

            // 4. Calculate Stats using the helper function above
            const {counts} = calculateMunicipalityStats(datasetToVisualize, kommuneDataset);

            // Recalculate Max Count EXCLUDING "København" AND "Frederiksberg"
            let adjustedMaxCount = 0;
            Object.entries(counts).forEach(([name, count]) => {
                if (name !== 'København' && name !== 'Frederiksberg') {
                    if (count > adjustedMaxCount) adjustedMaxCount = count;
                }
            });

            console.log("Max applications (excluding top 2):", adjustedMaxCount);

            // 5. Define Style Function (using the calculated counts)
            function heatmapStyle(feature) {
                // Get the name from the GeoJSON property
                const muniName = feature.properties.label_dk;

                // Get the count we calculated (default to 0 if not found)
                const count = counts[muniName] || 0;

                // Data color scheme outliers
                if (muniName === 'København') {
                    return {
                        fillColor: '#4B0082',
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.6
                    };
                } else if (muniName === 'Frederiksberg') {
                    return {
                        fillColor: '#4B0082',
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.4
                    };
                }

                return {
                    fillColor: getHeatmapColor(count, adjustedMaxCount),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.8
                };
            }

            // 6. Add GeoJSON layer to map
            L.geoJSON(geoJsonData, {
                style: heatmapStyle,
                onEachFeature: function (feature, layer) {
                    const muniName = feature.properties.label_dk;
                    const count = counts[muniName] || 0;

                    // Add a popup with the municipality name and count
                    layer.bindTooltip(`<strong>${muniName}</strong><br>${count} Optagelser`);
                }
            }).addTo(map);

            // 7 called last to draw schools on top of municipality zones
            mapEkSchools()
        })
        .catch(err => {
            console.error("Error loading GeoJSON:", err);
        });
}


// maps the municipalities from a dataset. can be used with a filteted dataset.
mapMunicipalitiesFromDataset(EKdataset)


function getMunicipalityNames(dataset) {
    const municipalities = [];

    for (const municipality of dataset.features) {
        const municipalityName = municipality.properties.label_dk;

        // 1. Check if name exists (is not null/undefined)
        // 2. Check if the array does NOT (!) include the name yet
        if (municipalityName && !municipalities.includes(municipalityName)) {
            municipalities.push(municipalityName);
        }
    }

    console.log("Unique Municipalities:", municipalities);
}


//////// END__LEAFLET ////////
//////// START__QUERIES ////////
function getAllAvg() {

    const pipeline = [
        {
            // Stage 1: Calculate raw sums and averages
            $group: {
                _id: null,
                totalCount: {$sum: 1},
                // Conditional Sums for percentages
                countM: {$sum: {$cond: [{$eq: ["$Køn", "Mand"]}, 1, 0]}},
                countF: {$sum: {$cond: [{$eq: ["$Køn", "Kvinde"]}, 1, 0]}},

                // Overall Average
                avgQuota: {$avg: "$KVOTIENT"},

                // Conditional Averages for Quota
                avgQuotaM: {$avg: {$cond: [{$eq: ["$Køn", "Mand"]}, "$KVOTIENT", null]}},
                avgQuotaF: {$avg: {$cond: [{$eq: ["$Køn", "Kvinde"]}, "$KVOTIENT", null]}},

                // Overall Age
                avgAge: {$avg: "$Alder"},

                // Conditional Averages for Age
                avgAgeM: {$avg: {$cond: [{$eq: ["$Køn", "Mand"]}, "$Alder", null]}},
                avgAgeF: {$avg: {$cond: [{$eq: ["$Køn", "Kvinde"]}, "$Alder", null]}}
            }
        },
        {
            // Stage 2: Format the output and calculate percentages
            $project: {
                _id: 0,
                general: {
                    averageQuota: {$round: ["$avgQuota", 1]},
                    avgQuotaM: {$round: ["$avgQuotaM", 1]},
                    avgQuotaF: {$round: ["$avgQuotaF", 1]},

                    // Calculate Percentage: (Count / Total) * 100
                    genderM: {$round: [{$multiply: [{$divide: ["$countM", "$totalCount"]}, 100]}, 1]},
                    genderF: {$round: [{$multiply: [{$divide: ["$countF", "$totalCount"]}, 100]}, 1]},

                    avgAge: {$round: ["$avgAge", 0]},
                    avgAgeM: {$round: ["$avgAgeM", 0]},
                    avgAgeF: {$round: ["$avgAgeF", 0]}
                }
            }
        }
    ]
    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryResult.all ? queryResult.all(): queryResult;

    if (result.length > 0) {
        const resultObj = result[0].general;

        console.log(resultObj);
    }
}
getAllAvg()

// Avg kvotient m. uddannelse
function getQuotaEducation(education) {
    const pipeline = [
        {
            $match: {"INSTITUTIONSAKT_BETEGNELSE": education}
        },
        {
            $group: {
                _id: null,
                AVGKVOTIENT: {$avg: "$KVOTIENT"}
            }
        }
    ]
    const queryresult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryresult[0].AVGKVOTIENT.toFixed(2)

    console.log(result)

}

//getQuotaEducation("PB i IT-arkitektur")


// Avg kvotient for alle uddannelser
function getAllEducationQuota() {
    const pipeline = [
        {
            $group: {
                _id: "$INSTITUTIONSAKT_BETEGNELSE",
                AVGKVOTIENT: {$avg: {$toDouble: "$KVOTIENT"}}
            }
        }
    ];

    const queryresult = new mingo.Aggregator(pipeline).run(EKdataset);

    // Convert grouped result into clean objects
    const result = queryresult.map(item => ({
        education: item._id,
        averageQuota: Number(item.AVGKVOTIENT.toFixed(2))
    }));

    console.log(result);
    return result;
}

//getAllEducationQuota();


// Avg kvotient m. køn og uddannelse
function getQuotaEducationGender(gender, education) {
    const pipeline = [
        {
            $match: {
                "Køn": gender,
                "INSTITUTIONSAKT_BETEGNELSE": education
            }
        },
        {
            $group: {
                _id: null,
                AVGKVOTIENT: {$avg: "$KVOTIENT"}
            }
        }
    ]
    const queryresult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryresult[0].AVGKVOTIENT.toFixed(2)

    console.log(result)
}

//getQuotaEducationGender("Mand", "Bygningskonstruktør")


// Avg kvotient m. køn og alle uddannelser
function getAllQuotaGenderEducation() {
    const pipeline = [
        {
            $group: {
                _id: "$INSTITUTIONSAKT_BETEGNELSE",
                // Calculate Male Average: If Gender is Mand, take KVOTIENT, else ignore (null)
                AvgQuotaM: {
                    $avg: {
                        $cond: [
                            {$eq: ["$Køn", "Mand"]},
                            {$toDouble: "$KVOTIENT"},
                            null
                        ]
                    }
                },
                // Calculate Female Average: If Gender is Kvinde, take KVOTIENT, else ignore (null)
                AvgQuotaF: {
                    $avg: {
                        $cond: [
                            // Note: Ensure this matches your data (e.g., "Kvinde")
                            {$eq: ["$Køn", "Kvinde"]},
                            {$toDouble: "$KVOTIENT"},
                            null
                        ]
                    }
                }
            }
        },
        // Optional: Formatting to match your desired output structure
        {
            $project: {
                _id: 0,
                education: "$_id",
                AvgQuotaM: 1,
                AvgQuotaF: 1
            }
        }
    ];

    const results = new mingo.Aggregator(pipeline).run(EKdataset);

    // Round results nicely
    const formatted = results.map(item => ({
        education: item.education,
        AvgQuotaM: item.AvgQuotaM ? Number(item.AvgQuotaM.toFixed(2)) : null,
        AvgQuotaF: item.AvgQuotaF ? Number(item.AvgQuotaF.toFixed(2)) : null
    }));

    console.log(formatted);
    return formatted;
}

//getAllQuotaGenderEducation()


// Avg alder
function getAvgAge() {
    const pipeline7 = [
        {
            $group: {
                _id: null,
                AVGAGE: {$avg: "$Alder"}
            }
        }
    ]
    const queryresult = new mingo.Aggregator(pipeline7).run(EKdataset);

    const result = queryresult[0].AVGAGE.toFixed();

    console.log(result)
    // logs("Alder"): 26
}

//getAvgAge()


// Avg alder m. køn 
function getAvgAgeGender(gender) {
    const pipeline8 = [
        {
            $match: {"Køn": gender}
        },
        {
            $group: {
                _id: null,
                AVGAGE2: {$avg: "$Alder"}
            }
        }
    ]
    const queryresult = new mingo.Aggregator(pipeline8).run(EKdataset);

    const result = queryresult[0].AVGAGE2.toFixed()

    console.log(result)
    //logs (Kvinde): 25
    //log (Mand): 27
}

//getAvgAgeGender("Mand")


// Avg alder m. uddannelse 
function getAvgAgeEducation(education) {
    const pipeline9 = [
        {
            $match: {"INSTITUTIONSAKT_BETEGNELSE": education}
        },
        {
            $group: {
                _id: null,
                AVGAGE3: {$avg: "$Alder"}
            }
        }
    ]
    const queryresult = new mingo.Aggregator(pipeline9).run(EKdataset);

    const result = queryresult[0].AVGAGE3.toFixed();

    console.log(result)
}

//getAvgAgeEducation("PB i IT-arkitektur")


// Avg alder m. køn og uddannelse
function getAvgAgeGenderEducation(gender, education) {
    const pipeline10 = [
        {
            $match: {
                "Køn": gender,
                "INSTITUTIONSAKT_BETEGNELSE": education
            }
        },
        {
            $group: {
                _id: null,
                AVGAGE4: {$avg: "$Alder"}
            }
        }
    ]
    const queryresult = new mingo.Aggregator(pipeline10).run(EKdataset);

    const result = queryresult[0].AVGAGE4.toFixed();

    console.log(result)
}

//getAvgAgeGenderEducation("Mand", "PB i IT-arkitektur");

//////// END__QUERIES ////////
//////// START__EVENTLISTENERS ////////


//////// END__EVENTLISTENERS ////////