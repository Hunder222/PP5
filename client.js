const testField = document.querySelector("#testField")



console.log(EKdataset[0]);

for (const element of EKdataset) {
    let newLi = document.createElement("li")
    newLi.textContent = element.Alder
    testField.appendChild(newLi)
}

