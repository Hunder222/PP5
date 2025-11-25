// DOM
const testField = document.querySelector("#testField");


console.log(EKdataset[0]);


//////// START__CHARTJS ////////


//////// END__CHARTJS ////////
//////// START___LEAFLET ////////


// map init and propertiees
var map = L.map('leafletMapDK').setView([56.2, 10.5], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
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
                    layer.bindPopup(`<strong>${muniName}</strong><br>Entries: ${count}`);
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

function getQuotaGender(gender) {
    const pipeline = [
        {
            $match: {"Køn": gender}
        },
        {
            $group: {
                _id: null,
                AVGKVOTIENT: {$avg: "$KVOTIENT"}
            }
        }
    ]

    const queryResult = new mingo.Aggregator(pipeline).run(EKdataset);

    const result = queryResult[0].AVGKVOTIENT.toFixed(2)
    // .toFixed(2) limit and rounds to 2 decimals

    console.log(result);
    // logs("Mand"): 6.11
    // logs("Kvinde"): 6.83
}

getQuotaGender("Kvinde")

function getAvgQuota() {
    const pipeline2 = [
        {
            $group: {
                _id: null,
                AVGKVOTIENT2: {$avg: "$KVOTIENT"}
            }
        }
    ]
    const queryResult2 = new mingo.Aggregator(pipeline2).run(EKdataset);

    const result = queryResult2[0].AVGKVOTIENT2.toFixed(2)

    console.log(result);
    //logs 6.42
}

getAvgQuota()

function getQuotaEducation(education) {
    const pipeline3 = [
        {
            $match: {"INSTITUTIONSAKT_BETEGNELSE": education}
        },
        {
            $group: {
                _id: null,
                AVGKVOTIENT3: {$avg: "$KVOTIENT"}
            }
        }
    ]
    const queryresult3 = new mingo.Aggregator(pipeline3).run(EKdataset);

    const result = queryresult3[0].AVGKVOTIENT3.toFixed(2)

    console.log(result)
}

getQuotaEducation("Bygningskonstruktør");

function getQuotaEducationGender(gender, education) {
    const pipeline4 = [
        {
            $match: {
                "Køn": gender,
                "INSTITUTIONSAKT_BETEGNELSE": education
            }
        },
        {
            $group: {
                _id: null,
                AVGKVOTIENT4: {$avg: "$KVOTIENT"}
            }
        }
    ]
    const queryresult4 = new mingo.Aggregator(pipeline4).run(EKdataset);
    const result = queryresult4[0].AVGKVOTIENT4.toFixed(2)
    console.log(result)
}
getQuotaEducationGender("Mand", "Bygningskonstruktør")


//////// END__QUERIES ////////
//////// START__EVENTLISTENERS ////////


//////// END__EVENTLISTENERS ////////