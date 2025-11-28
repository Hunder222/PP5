// DOM
const genderChartElement = document.querySelector("#genderChart")
const comboChartElement = document.querySelector("#comboChart")
const kvotient = document.querySelector("#kvotient")
const AlderBtm = document.querySelector("#alder")
AlderBtm.addEventListener("click",()=>{
    showAgeCharts()
})
kvotient.addEventListener("click",()=>{
    showQuotaCharts()

})

const uddannelseInput= document.querySelector("#uddannelse-input")
uddannelseInput.addEventListener("input",()=>{
    if (uddannelseInput.value === "Alle uddannelser") {
        createMapFromDataset(EKdataset)
    } else {
        getStatsForEducation(uddannelseInput.value)
    }
})


console.log(EKdataset[0]);

// data
const queriedData = {
    general: {
        averageQuota: 0,
        avgQuotaM: 0,
        avgQuotaF: 0,
        genderM: 0,
        genderF: 0,
        avgAge: 0,
        avgAgeM: 0,
        avgAgeF: 0
    },
    educations: {
        names: [],
        ages: [],
        agesAvg: [],
        quotas: [],
        quotasAvg: [],
        genderPctM: [],
        genderPctF: []
    }
}









//////// START__CHARTJS ////////

Chart.register(ChartDataLabels)



// --- CHANGE 2: Remove "let" (use the variable created at the top) ---
let genderChart = new Chart(genderChartElement, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Mand',
                data: [],
                backgroundColor: '#36a2eb',
            },
            {
                label: 'Kvinde',
                data: [],
                backgroundColor: '#ff6384',
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    // 1. ADD THIS: Show the FULL name in the tooltip title
                    title: function (context) {
                        return context[0].label;
                    },
                    // 2. Existing label callback for the percentage
                    label: function (context) {
                        let value = context.raw;
                        return context.dataset.label + ": " + value.toFixed(1) + "%";
                    }
                }
            },
            datalabels: {
                color: 'white',
                font: { weight: 'bold' },
                formatter: (value) => {
                    return value.toFixed(1) + '%';
                }
            },
            legend: {
                display: true,
                onClick: Chart.defaults.plugins.legend.onClick
            }
        },
        scales: {
            x: {
                stacked: true,
                // 3. ADD THIS SECTION to truncate the text
                ticks: {
                    autoSkip: false, // Try to show every label
                    maxRotation: 45, // Keep text angled
                    minRotation: 45,
                    callback: function (value) {
                        // Get the current label
                        let label = this.getLabelForValue(value);

                        // If it's longer than 15 characters, cut it and add "..."
                        if (label.length > 15) {
                            return label.substr(0, 15) + '...';
                        }
                        return label;
                    }
                }
            },
            y: {
                stacked: true,
                min: 0,
                suggestedMax: 100,
            }
        }
    }
});


let comboChart = new Chart(comboChartElement, {
    data: {
        labels: [],
        datasets: [
            // --- DATASET 1: VISUALS (Box + Red Dot) ---
            {
                type: 'boxplot',
                label: 'Boxplot',
                data: [],
                backgroundColor: 'rgba(104, 99, 255, 0.5)',
                borderColor: 'rgba(99, 138, 255, 1)',
                borderWidth: 1,
                outlierColor: '#999999',

                order: 10,

                // DISABLE labels for the box itself
                datalabels: {
                    display: false
                }
            },

            // --- DATASET 2: LABELS (Hidden Line Anchors) ---
            {
                type: 'line',
                label: 'Gennemsnit',
                data: [], // Use the averages array directly here

                // Make the actual graph invisible
                borderColor: '#d10a0aff',
                backgroundColor: 'transparent',
                borderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 0,

                order: 0,

                // Configure labels specifically for this "Ghost" dataset
                datalabels: {
                    display: true,
                    align: 'top',     // Push text UP from the anchor
                    anchor: 'center', // Lock anchor to the exact data point (the average)
                    offset: 0,       // Space between the invisible point (center of red dot) and text

                    color: '#ff3434ff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    autoSkip: false, // Force all labels to show
                    maxRotation: 45, // Optional: Keep it angled, or set to 0 for horizontal
                    minRotation: 45,
                    callback: function (value) {
                        // Get the actual label string
                        let label = this.getLabelForValue(value);

                        // IF label is longer than 15 characters, cut it
                        if (label.length > 15) {
                            return label.substr(0, 15) + '...';
                        }
                        return label;
                    }
                }
            }
        },
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
                },
                callbacks: {
                    title: function (context) {
                        // Return the full label in the tooltip header
                        return context[0].label;
                    }
                }
            },
            legend: {
                display: true
            }
        }
    }
});



//////// END__CHARTJS ////////
//////// START___LEAFLET ////////


// ==========================================
// 1. SETUP MAP & GLOBALS
// ==========================================

let map = L.map('leafletMapDK').setView([56.2, 10.5], 6.4);
let currentGeoJsonLayer = null; // We store the active layer here
let cachedGeoJsonData = null;   // We store the raw map data here so we don't fetch it twice

// Base Layers
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Add Schools ONCE (Use a pane or high z-index to keep them on top)
// We create a specific pane for markers so they always stay above polygons
map.createPane('markersPane');
map.getPane('markersPane').style.zIndex = 650;
mapEkSchools();


// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

function mapEkSchools() {
    const EKschools = [
        { name: "EK Guldbergsgade", latlng: [55.69149690984243, 12.555008402914718] },
        { name: "EK Landemærket", latlng: [55.68202742413432, 12.576277748303877] },
        { name: "EK Lygten", latlng: [55.706369426829156, 12.539137981532795] },
        { name: "EK Nansensgade", latlng: [55.68192028780662, 12.562680082210507] },
        { name: "EK Prinsesse Charlottes Gade", latlng: [55.6944551895993, 12.550846762451158] }
    ];

    EKschools.forEach(school => {
        L.circle(school.latlng, {
            color: "white", opacity: 0.5,
            fillColor: 'blue', fillOpacity: 0.3, radius: 250,
            pane: 'markersPane' // distinct pane to stay on top
        }).bindTooltip(`<b>${school.name}</b>`).addTo(map);
    });
}

function createCityLookup(municipalityData) {
    const lookup = new Map();
    municipalityData.forEach(entry => {
        const kommune = entry.Kommune;
        if (entry.Byer && Array.isArray(entry.Byer)) {
            entry.Byer.forEach(city => {
                lookup.set(city.trim().toLowerCase(), kommune);
            });
        }
    });
    return lookup;
}

function calculateMunicipalityStats(userEntries, municipalityMappingJson) {
    const cityToMunicipality = createCityLookup(municipalityMappingJson);
    const counts = {};
    let maxCount = 0;

    municipalityMappingJson.forEach(m => counts[m.Kommune] = 0);

    for (const entry of userEntries) {
        const cityRaw = entry["Bopæl_POSTDISTRIKT"];
        if (!cityRaw) continue;
        const cityClean = cityRaw.trim().toLowerCase();
        const municipalityName = cityToMunicipality.get(cityClean);

        if (municipalityName) {
            counts[municipalityName] = (counts[municipalityName] || 0) + 1;
            if (counts[municipalityName] > maxCount) {
                maxCount = counts[municipalityName];
            }
        }
    }
    return { counts, maxCount };
}

function getHeatmapColor(count, max) {
    if (count === 0) return 'rgba(12,12,12,0.05)';
    const intensity = count / max;
    const opacity = 0.1 + (intensity * 0.7);
    return `rgba(220, 20, 60, ${opacity})`;
}


// ==========================================
// 3. MAIN UPDATE FUNCTION
// ==========================================

function createMapFromDataset(datasetToVisualize) {
    // 1. Check if we have the raw GeoJSON data yet.
    if (!cachedGeoJsonData) {
        console.log("Fetching GeoJSON for the first time...");
        fetch('https://raw.githubusercontent.com/magnuslarsen/geoJSON-Danish-municipalities/master/municipalities/municipalities.geojson')
            .then(r => r.json())
            .then(data => {
                cachedGeoJsonData = data; // Store it!
                // Recursive call: Now that we have data, run the function again
                createMapFromDataset(datasetToVisualize);
            })
            .catch(err => console.error("Error loading GeoJSON:", err));
        return; // Stop here, wait for fetch to finish
    }

    // 2. If a layer already exists, REMOVE it to clear the map
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer);
    }

    console.log("Processing stats and updating map...");

    // 3. Process Stats (Assuming 'kommuneDataset' is available globally, 
    // otherwise pass it as an argument too)
    const { counts } = calculateMunicipalityStats(datasetToVisualize, kommuneDataset);

    // Recalculate Max
    let adjustedMaxCount = 0;
    Object.entries(counts).forEach(([name, count]) => {
        if (name !== 'København' && name !== 'Frederiksberg') {
            if (count > adjustedMaxCount) adjustedMaxCount = count;
        }
    });

    // 4. Create the new Layer
    function heatmapStyle(feature) {
        const muniName = feature.properties.label_dk;
        const count = counts[muniName] || 0;

        if (muniName === 'København') {
            return { fillColor: '#4B0082', weight: 1, color: 'white', fillOpacity: 0.6 };
        } else if (muniName === 'Frederiksberg') {
            return { fillColor: '#4B0082', weight: 1, color: 'white', fillOpacity: 0.4 };
        }
        return {
            fillColor: getHeatmapColor(count, adjustedMaxCount),
            weight: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8
        };
    }

    currentGeoJsonLayer = L.geoJSON(cachedGeoJsonData, {
        style: heatmapStyle,
        onEachFeature: function (feature, layer) {
            const muniName = feature.properties.label_dk;
            const count = counts[muniName] || 0;
            layer.bindTooltip(`<strong>${muniName}</strong><br>${count} Optagelser`);
        }
    });

    // 5. Add to map and push to back so Schools stay on top
    currentGeoJsonLayer.addTo(map);
    currentGeoJsonLayer.bringToBack();
}


// maps the municipalities from a dataset. can be used with a filteted dataset.
createMapFromDataset(EKdataset)



//////// END__LEAFLET ////////

//////// START__QUERIES ////////

// Får average for køn, alder og kvotient
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

    const result = queryResult.all ? queryResult.all() : queryResult;

    if (result.length > 0) {
        const resultObj = result[0].general;

        console.log(resultObj);
        
    }
}
getAllAvg()



// Får average for uddannelser med brug af køn, alder og kvotient
function getAvgForEducation() {
    const pipeline = [
        {
            // STAGE 1: Group by Education Name first
            $group: {
                _id: "$INSTITUTIONSAKT_BETEGNELSE",


                // Collect raw arrays for this specific education
                ages: {$push: "$Alder"},
                quotas: {$push: "$KVOTIENT"},


                // Calculate stats for this education
                avgAge: {$avg: "$Alder"},
                avgQuota: {$avg: "$KVOTIENT"},


                // Counts for percentage calc
                totalCount: {$sum: 1},
                countM: {$sum: {$cond: [{$eq: ["$Køn", "Mand"]}, 1, 0]}},
                countF: {$sum: {$cond: [{$eq: ["$Køn", "Kvinde"]}, 1, 0]}}
            }
        },
        {
            // STAGE 2: Format the single education stats (Percentages & Rounding)
            $project: {
                name: "$_id", // Rename _id to name for clarity
                ages: 1,
                quotas: 1,
                avgAge: {$round: ["$avgAge", 0]},
                avgQuota: {$round: ["$avgQuota", 1]},
                // Calculate %
                pctM: {$round: [{$multiply: [{$divide: ["$countM", "$totalCount"]}, 100]}, 1]},
                pctF: {$round: [{$multiply: [{$divide: ["$countF", "$totalCount"]}, 100]}, 1]}
            }
        },
        {
            // STAGE 3: Sort Alphabetically (Ensures index 0 matches across all arrays)
            $sort: {name: 1}
        },
        {
            // STAGE 4: Group Everything into the final arrays
            // Because we sorted in Stage 3, the pushes here happen in alphabetical order
            $group: {
                _id: null,
                names: {$push: "$name"},


                // Pushing an array into a group creates an array of arrays [[21,24...], [22,25...]]
                ages: {$push: "$ages"},
                agesAvg: {$push: "$avgAge"},


                quotas: {$push: "$quotas"},
                quotasAvg: {$push: "$avgQuota"},


                genderPctM: {$push: "$pctM"},
                genderPctF: {$push: "$pctF"}
            }
        }
    ];

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryResult.all ? queryResult.all() : queryResult;

    if (result.length > 0) {
        const resultObj = result[0];

        console.log(resultObj);

        queriedData.educations.names = resultObj.names
        queriedData.educations.ages = resultObj.ages
        queriedData.educations.agesAvg = resultObj.agesAvg
        queriedData.educations.quotas = resultObj.quotas
        queriedData.educations.quotasAvg = resultObj.quotasAvg
        queriedData.educations.genderPctM = resultObj.genderPctM
        queriedData.educations.genderPctF = resultObj.genderPctF
    }
}
getAvgForEducation()


// Finder alt data indenfor en givet uddannelse
function getStatsForEducation (uddannelse) {
    if (!uddannelse) return null;

    const pipeline = [
        {
            // STAGE 1: Filtrér (WHERE) data for kun at inkludere den valgte uddannelse
            $match: {
                "INSTITUTIONSAKT_BETEGNELSE": uddannelse
            }
        }
    ];

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);
    const results = queryResult.all ? queryResult.all() : queryResult;

    // Returnerer det aggregerede objekt, eller null hvis ingen data
    console.log(results.length > 0 ? results : null);
    console.log(results.length);


    createMapFromDataset(results)
}



//////// END__QUERIES ////////
//////// START__FUNCTIONS ////////


function showGenders() {
    genderChart.data.datasets[0].data = queriedData.educations.genderPctM
    genderChart.data.datasets[1].data = queriedData.educations.genderPctF
    genderChart.data.labels = queriedData.educations.names

    genderChart.update()

}

showGenders()


function showAgeCharts() {
    comboChart.data.datasets[0].data = queriedData.educations.ages
    comboChart.data.datasets[1].data = queriedData.educations.agesAvg
    comboChart.data.labels = queriedData.educations.names
    comboChart.options.plugins.title.text = 'Aldre på uddannelser'
    

    comboChart.update()
}
//showAgeCharts()


function showQuotaCharts() {
    comboChart.data.datasets[0].data = queriedData.educations.quotas
    comboChart.data.datasets[1].data = queriedData.educations.quotasAvg
    comboChart.data.labels = queriedData.educations.names
    comboChart.options.plugins.title.text = 'Kvotienter på uddannelser'


    comboChart.update()
}
showQuotaCharts()





//////// END__FUNCTIONS ////////


//////// START__EVENTLISTENERS ////////


//////// END__EVENTLISTENERS ////////