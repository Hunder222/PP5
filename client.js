
const testField = document.querySelector("#testField");
console.log(EKdataset[0]);

// clean dataset
for (const element of EKdataset) {
    let kvotient = element.KVOTIENT
    if (kvotient){
        if (typeof(kvotient)==="string") {
            kvotient = kvotient.replace(',', '.')
            kvotient = parseFloat(kvotient)
            element.KVOTIENT = kvotient
        }
        
    }
}


const query = {
    "Køn": "Mand"
};


const filteredData = EKdataset.filter(sift.default(query)); 

for (const element of filteredData) {
    let newLi = document.createElement("li");
    newLi.textContent = element.KVOTIENT;
    testField.appendChild(newLi);
}




