fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/speciesPanelUtility.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace(/while *\(speciesAbilities.firstChild\)/i, "\nbuildSpeciesPanelAbilityTablesContainer(name)\n$&")
    text = text.replace("getPokemonResistanceValueAgainstType", "getPokemonResistanceValueAgainstTypeEE")
    text = text.replace("getPokemonEffectivenessValueAgainstType", "getPokemonEffectivenessValueAgainstTypeEE")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})

function buildSpeciesPanelAbilityTablesContainer(name){
    buildSpeciesPanellevelUpAbilitiesTable(name)
    buildSpeciesPanelTutorAbilityTable(name)
}

function buildSpeciesPanellevelUpAbilitiesTable(name){
    while(speciesPanellevelUpAbilitiesTableTbody.firstChild){
        speciesPanellevelUpAbilitiesTableTbody.removeChild(speciesPanellevelUpAbilitiesTableTbody.firstChild)
    }

    let duplicate = []
    for(let i = 0; i < species[name]["levelUpAbilities"].length; i++){
        if(!duplicate.includes(species[name]["levelUpAbilities"][i][1])){
            const row = document.createElement("tr")

            const abilityLevel = document.createElement("td")
            abilityLevel.innerText = species[name]["levelUpAbilities"][i][0]
            row.append(abilityLevel)

            const abilityName = document.createElement("td")
            abilityName.innerText = abilities[species[name]["levelUpAbilities"][i][1]]["ingameName"]
            abilityName.className = "bold"
            row.append(abilityName)

            const abilityInnate = document.createElement("td")
            if(species[name]["levelUpAbilities"][i][2] === "FALSE"){
                abilityInnate.innerText = "-"
            }
            else{
                abilityInnate.innerText = "✔"
            }
            row.append(abilityInnate)

            const abilityTemporary = document.createElement("td")
            if(species[name]["levelUpAbilities"][i][3] === "FALSE"){
                abilityTemporary.innerText = "-"
            }
            else{
                abilityTemporary.innerText = "✔"
            }
            row.append(abilityTemporary)

            for(let j = 0; j < 4; j++){
                const abilityIncompatibility = document.createElement("td")
                abilityIncompatibility.innerText = abilities[species[name]["levelUpAbilities"][i][4+j]]["ingameName"]
                abilityIncompatibility.className = "bold"
                row.append(abilityIncompatibility)
            }

            row.addEventListener("click", () => {
                createPopupAbility([species[name]["levelUpAbilities"][i][1]])
            })

            speciesPanellevelUpAbilitiesTableTbody.append(row)
            duplicate.push(species[name]["levelUpAbilities"][i][1])
        }
    }

    if(species[name]["levelUpAbilities"].length === 0){
        speciesPanellevelUpAbilitiesTable.classList.add("hide")
    }
    else{
        speciesPanellevelUpAbilitiesTable.classList.remove("hide")
    }
}

function buildSpeciesPanelTutorAbilityTable(name){
    while(speciesPanelTutorAbilityTableTbody.firstChild){
        speciesPanelTutorAbilityTableTbody.removeChild(speciesPanelTutorAbilityTableTbody.firstChild)
    }

    /* ------------------- very cool and (unused) poggers code -------------------- */
    /*
    let row = document.createElement("tr")
    for(let i = 0; i < species[name]["tutorAbilities"].length; i++){
        if(i%8 == 0){
            speciesPanelTutorAbilityTableTbody.append(row)
            row = document.createElement("tr")
        }
        const abilityName = document.createElement("td")
        abilityName.innerText = abilities[species[name]["tutorAbilities"][i]]["ingameName"]
        abilityName.className = "bold"

        abilityName.addEventListener("click", () => {
            createPopupAbility([species[name]["tutorAbilities"][i]])
        })

        row.append(abilityName)
    }
    speciesPanelTutorAbilityTableTbody.append(row)
    */
   
    for(let i = 0; i < species[name]["tutorAbilities"].length; i++){
        let row = document.createElement("tr")
        const abilityName = document.createElement("td")
        abilityName.innerText = abilities[species[name]["tutorAbilities"][i]]["ingameName"]
        abilityName.className = "bold"

        row.addEventListener("click", () => {
            createPopupAbility([species[name]["tutorAbilities"][i]])
        })

        row.append(abilityName)
        speciesPanelTutorAbilityTableTbody.append(row)
    }

    if(species[name]["tutorAbilities"].length === 0){
        speciesPanelTutorAbilityTable.classList.add("hide")
    }
    else{
        speciesPanelTutorAbilityTable.classList.remove("hide")
    }
}









function getPokemonResistanceValueAgainstTypeEE(speciesObj, type){
    let value = 1
    if((speciesObj["type1"] !== speciesObj["type2"])){
        if(typeof speciesObj["type3"] !== "undefined"){
            if(speciesObj["type3"] !== speciesObj["type1"] && speciesObj["type3"] !== speciesObj["type2"]){
                value = typeChart[type][speciesObj["type1"]] * typeChart[type][speciesObj["type2"]] * typeChart[type][speciesObj["type3"]]
            }
        }
        else{
            value = typeChart[type][speciesObj["type1"]] * typeChart[type][speciesObj["type2"]]
        }
    }
    else{
        if(typeof speciesObj["type3"] !== "undefined"){
            if(speciesObj["type3"] !== speciesObj["type1"] && speciesObj["type3"] !== speciesObj["type2"]){
                value = typeChart[type][speciesObj["type1"]] * typeChart[type][speciesObj["type3"]]
            }
        }
        else{
            value = typeChart[type][speciesObj["type1"]]
        }
    }

    if(value == 0.25){
        value = 0.4
    }
    else if(value == 0.125){
        value = 0.3
    }
    else if(value == 4){
        value = 2.5
    }
    else if(value == 8){
        value = 3
    }

    return value
}

function getPokemonEffectivenessValueAgainstTypeEE(speciesObj, type){
    let offensiveValue = typeChart[speciesObj["type1"]][type]
    if(typeChart[speciesObj["type2"]][type] > typeChart[speciesObj["type1"]][type]){
        offensiveValue = typeChart[speciesObj["type2"]][type]
    }
    if(typeof speciesObj["type3"] !== "undefined"){
        if(typeChart[speciesObj["type3"]][type] > typeChart[speciesObj["type1"]][type] && typeChart[speciesObj["type3"]][type] > typeChart[speciesObj["type2"]][type]){
            offensiveValue = typeChart[speciesObj["type3"]][type]
        }
    }

    if(offensiveValue == 0.25){
        offensiveValue = 0.4
    }
    else if(offensiveValue == 0.125){
        offensiveValue = 0.3
    }
    else if(offensiveValue == 4){
        offensiveValue = 2.5
    }
    else if(offensiveValue == 8){
        offensiveValue = 3
    }

    return offensiveValue
}