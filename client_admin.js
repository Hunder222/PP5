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