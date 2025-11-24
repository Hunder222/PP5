
const testField = document.querySelector("#testField");
console.log(EKdataset[0]);


function cleanDataset() {
    // clean dataset
    for (const element of EKdataset) {
        // clean kvotient string to float number. i.e "8,6" to 8.6
        let kvotient = element.KVOTIENT
        if (kvotient){
            if (typeof(kvotient)==="string") {
                kvotient = kvotient.replace(',', '.')
                kvotient = parseFloat(kvotient)
                element.KVOTIENT = kvotient
            }
        }
        // clean Malmø

    }
}




function getQuotaGender(gender){
    const pipeline = [
        {
            $match: { "Køn": gender }
        },
        {
            $group: {
                _id: null,
                AVGKVOTIENT: { $avg: "$KVOTIENT" }
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



