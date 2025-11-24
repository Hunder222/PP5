// client.js

const testField = document.querySelector("#testField");
// console.log(EKdataset[0]); // Optional: keep for debugging

const query = {
    "Køn": "Mand"
};

// --- THIS IS THE CRITICAL CHANGE ---
// Access the actual function from the '.default' property of the global object.
const filteredData = EKdataset.filter(sift.default(query)); 

// ... rest of the code is fine
for (const element of filteredData) {
    let newLi = document.createElement("li");
    newLi.textContent = element.Køn;
    testField.appendChild(newLi);
}