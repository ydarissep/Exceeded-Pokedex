fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/trainers/displayTrainers.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replaceAll("createTrainerSpeciesTbody(trainers[zone][trainer])", "createTrainerSpeciesTbodyEE(trainers[zone][trainer])")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})



function createTrainerSpeciesTbodyEE(trainerObj){
    const trainerTbody = document.createElement("tbody"); trainerTbody.className = "trainerTbody"
    let difficulty = "Normal"
    if(trainerObj["party"][trainersDifficulty]){
        difficulty = trainersDifficulty
    }

    for(let i = 0; i < trainerObj["party"][difficulty].length; i++){
        const trainerSpeciesObj = trainerObj["party"][difficulty][i]
        if(species[trainerSpeciesObj["name"]]["baseSpeed"] > 0){
            const trainerSpeciesContainer = document.createElement("td")

            const speciesSpriteContainer = document.createElement("div"); speciesSpriteContainer.className = "trainerSpeciesSprite"
            let speciesName = trainerSpeciesObj["name"]
            const speciesSprite = document.createElement("img"); speciesSprite.className = `sprite${speciesName}`; speciesSprite.src = getSpeciesSpriteSrc(speciesName)
            speciesSpriteContainer.append(speciesSprite)
            trainerSpeciesContainer.append(speciesSpriteContainer)
            speciesSpriteContainer.addEventListener("click", () => {
                createSpeciesPanel(trainerSpeciesObj["name"])
                document.getElementById("speciesPanelMainContainer").scrollIntoView(true)
            })

            let abilityArray = getWildPokemonAbilities(trainerSpeciesObj["name"], trainerSpeciesObj["lvl"])
            const trainerSpeciesAbility = document.createElement("div"); trainerSpeciesAbility.innerText = abilities[abilityArray[0]]["ingameName"]; trainerSpeciesAbility.className = "hyperlink bold trainerSpeciesAbility"
            trainerSpeciesAbility.addEventListener('click', () => {
                if(typeof innatesDefined !== "undefined"){
                    abilityArray = abilityArray.concat(species[trainerSpeciesObj["name"]]["innates"])
                }
                createPopupAbility(abilityArray)
            }) 
            trainerSpeciesContainer.append(trainerSpeciesAbility)

            const trainerSpeciesItem = document.createElement("div"); trainerSpeciesItem.innerText = sanitizeString(trainerSpeciesObj["item"]); trainerSpeciesItem.className = "bold trainerSpeciesItem"
            trainerSpeciesContainer.append(trainerSpeciesItem)

            trainerSpeciesContainer.append(returnEVsIVsObj(trainerSpeciesObj))

            trainerSpeciesContainer.append(returnMovesObj(trainerSpeciesObj))

            trainerTbody.append(trainerSpeciesContainer)
        }
    }

    return trainerTbody
}



function getWildPokemonAbilities(name, lvl){
    let abilitiesArray = []

    for(let i = species[name]["levelUpAbilities"].length - 1; i >= 0; i--){
        if(parseInt(species[name]["levelUpAbilities"][i][0]) <= parseInt(lvl)){
            if(!abilitiesArray.includes(species[name]["levelUpAbilities"][i][4]) && !abilitiesArray.includes(species[name]["levelUpAbilities"][i][5]) && !abilitiesArray.includes(species[name]["levelUpAbilities"][i][6]) && !abilitiesArray.includes(species[name]["levelUpAbilities"][i][7]) && !abilitiesArray.includes(species[name]["levelUpAbilities"][i][1])){
                abilitiesArray.push(species[name]["levelUpAbilities"][i][1])
            }
            if(abilitiesArray.length === 4){
                break
            }
        }
    }

    return abilitiesArray
}