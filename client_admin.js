//// DOM
const citizenshipChartElement = document.querySelector("#statsborgerskab")
const educationChartElement = document.querySelector("#studieretning")
const firstPriorityChartElement = document.querySelector("#førstePrioritet")






//// charts ////


let citizenshipChart = new Chart(citizenshipChartElement, {
    data: {
        labels: [],
        datasets: [
            // --- DATASET 1: Foreigns ---
            {
                type: 'pie',
                label: 'Fordeling af udland',
                data: [],
                customLabels: [], // Filled via JS later
                borderColor: '#883232ac',
                backgroundColor: '#cf4545ff',
                borderWidth: 1,
                order: 0,
                datalabels: {
                    display: false, // ... your existing settings
                    formatter: function (value, context) {
                        const label = context.dataset.customLabels[context.dataIndex];
                        return label ? label + '\n' + value + '%' : '';
                    }
                }
            },
            // --- DATASET 2: Danish and Foreign ---
            {
                type: 'pie',
                label: 'Dansk og udland',
                data: [],

                // 1. ADD THIS so the tooltip knows what to call the inner slices
                customLabels: ['Danmark', 'Udland'],

                backgroundColor: ['#ebebebff', '#858585ff'],
                borderColor: ['#565656ff', '#303030ff'],
                borderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 0,
                order: 10,
                datalabels: { display: false }
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: -15, bottom: 30 }
        },
        plugins: {
            title: { display: true, text: '' },
            tooltip: {
                mode: 'nearest',
                intersect: true,

                // 2. REMOVED the 'filter' function here
                // (It used to be here blocking dataset 2)

                callbacks: {
                    label: function (context) {
                        let value = context.parsed;

                        // This logic now works for BOTH datasets automatically
                        let name = context.dataset.customLabels
                            ? context.dataset.customLabels[context.dataIndex]
                            : null;

                        if (name) {
                            return name + ': ' + value + '%'; // Added '%' symbol
                        } else {
                            return context.dataset.label + ': ' + value;
                        }
                    }
                }
            },
            legend: { display: true }
        }
    },
    plugins: [ChartDataLabels]
});


citizenshipChart.update()






let studieretningChart = new Chart(educationChartElement, {
    type: 'bar',
    data: {
        labels: [""],
        datasets: [
            {
                label: 'Eksamenstype',
                data: [54],
                
                backgroundColor: [
                    '#a22733ff', // Color for STX
                    '#5BA4CF', // Color for HF
                    'white', // Color for Andet
                    '#3648a4ff', // Color for HHX
                    '#9966FF', // Color for EUD
                    '#3e5888ff', // Color for HTX
                    '#858585ff', // Color for Udenlandsk
                    '#c4c3c3ff'  // Color for EUX
                ],
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            datalabels: {
                color: 'white',
                font: { weight: 'bold' },
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: { stacked: true },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: "antal ansøgere"
                }
            }
        }
    }
});

studieretningChart.update()





let firstPriorityChart = new Chart(firstPriorityChartElement, {
    type: 'bar',
    data: {
        labels: ["lorem", "ipsum", "dolor"],
        datasets: [
            {
                label: 'Første priotet',
                data: [20,18,26],
                backgroundColor: '#1a38a5',
            },
            {
                label: 'ikke første priotet',
                data: [10, 7, 13],
                backgroundColor: '#fc8840ff',
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            datalabels: {
                color: 'white',
                font: { weight: 'bold' },
            }
        },
        scales: {
            x: { stacked: true },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: "antal ansøgere"
                }
            }
        }
    }
});





//// leaflet


// ==========================================
// 1. SETUP MAP & GLOBALS
// ==========================================

let map = L.map('heatMap').setView([56.2, 11.5], 6.4);
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






//////// START__QUERIES ////////

function getCountFromDenmarkOrAbroad() {
    const pipeline = [
        {
            $facet: {
                // FACET 1: Summary (Denmark vs Abroad)
                "Samlet_statsborgerskab": [
                    {
                        $group: {
                            _id: {
                                $cond: {
                                    if: { $eq: ["$Statsborgerskab", "Danmark"] },
                                    then: "Danmark",
                                    else: "Udlandet"
                                }
                            },
                            Total: { $sum: 1 }
                        }
                    },
                    // -- New formatting stages --
                    {
                        $group: {
                            _id: null,
                            names: { $push: "$_id" },
                            counts: { $push: "$Total" }
                        }
                    },
                    {
                        $project: { _id: 0, names: 1, counts: 1 }
                    }
                ],

                // FACET 2: Detailed (Specific Foreign Countries)
                "Udenlandsk_statsborgerskab": [
                    {
                        $match: {
                            Statsborgerskab: { $ne: "Danmark" }
                        }
                    },
                    {
                        $group: {
                            _id: "$Statsborgerskab",
                            Total: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { Total: -1 }
                    },
                    // -- New formatting stages --
                    {
                        $group: {
                            _id: null,
                            names: { $push: "$_id" },
                            counts: { $push: "$Total" }
                        }
                    },
                    {
                        $project: { _id: 0, names: 1, counts: 1 }
                    }
                ]
            }
        }
    ];

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    // Mingo facet result comes as an array with 1 object.
    const rawResult = (queryResult.all ? queryResult.all() : queryResult)[0];

    // The facets return arrays containing our formatted object, 
    // so we extract the first item [0] to get a clean object.
    const finalResult = {
        Samlet: rawResult.Samlet_statsborgerskab[0] || { names: [], counts: [] },
        Udenlandsk: rawResult.Udenlandsk_statsborgerskab[0] || { names: [], counts: [] }
    };

    console.log(finalResult);

    citizenshipChart.data.datasets[0].data = finalResult.Udenlandsk.counts
    citizenshipChart.data.datasets[0].customLabels = finalResult.Udenlandsk.names    
    
    citizenshipChart.data.datasets[1].data = finalResult.Samlet.counts
    
    citizenshipChart.update();
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
        },
        {
            $group: {
                _id: null,
                names: { $push: "$_id" },
                counts: { $push: "$antal" }
            }
        },
        {
            $project: {
                _id: 0,
                names: 1,
                counts: 1
            }
        }
    ];

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    // Mingo returns an array, so we grab the first (and only) item
    const finalResult = (queryResult.all ? queryResult.all() : queryResult)[0];

    console.log(finalResult);


    studieretningChart.data.labels = finalResult.names
    studieretningChart.data.datasets[0].data = finalResult.counts

    studieretningChart.update()

}

getCountFieldOfStudy()



function getCountFirstPriority() {
    const pipeline = [
        // 1. Group and calculate counts
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
        },

        // 2. Sort Alphabetically by Name
        {
            $sort: { _id: 1 }
        },

        // 3. Transpose to parallel arrays
        {
            $group: {
                _id: null,
                names: { $push: "$_id" },
                counts_yes: { $push: "$antal_J" },
                counts_no: { $push: "$antal_N" }
            }
        },

        // 4. Remove the temporary _id field
        {
            $project: {
                _id: 0,
                names: 1,
                counts_yes: 1,
                counts_no: 1
            }
        }
    ]

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    // Grab the first object from the result array
    const finalResult = (queryResult.all ? queryResult.all() : queryResult)[0];

    console.log(finalResult)



    firstPriorityChart.data.labels = finalResult.names
    firstPriorityChart.data.datasets[0].data = finalResult.counts_yes
    firstPriorityChart.data.datasets[1].data = finalResult.counts_no



}
getCountFirstPriority()

//////// END__QUERIES ////////


