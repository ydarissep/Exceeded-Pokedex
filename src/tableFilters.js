fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/tableFilters.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("filterSpeciesAbility(value, label, operator)", "filterSpeciesAbilitiesLearnsets(value, label, operator)")

    eval.call(window,text)
}).catch(error => {
    footerP(error)
    console.warn(error)
})



function filterSpeciesAbilitiesLearnsets(value = "Placeholder", label = "Placeholder", operator){
    let abilityName = null
    Object.keys(abilities).forEach(ability => {
        if(abilities[ability]["ingameName"] === value){
            abilityName = ability
        }
    })
    if(abilityName){
        for(let i = 0, j = tracker.length; i < j; i++){
            let passed = true
            let name = tracker[i]["key"]
            if(tracker === locationsTracker){
                name = tracker[i]["key"].split("\\")[2]
            }
            if(!species[name]["levelUpAbilities"].find((levelUpAbility) => levelUpAbility[1] == abilityName)  && !species[name]["tutorAbilities"].includes(abilityName)){
                if(typeof innatesDefined !== "undefined"){
                    if(!species[name]["innates"].includes(abilityName)){
                        passed = false
                    }
                }
                else{
                    passed = false
                }
            }

            tracker[i]["filter"] = filterLogicalConnector(tracker[i]["filter"], value.replaceAll(" ", ""), label.replaceAll(" ", ""), operator, passed)
        }
    }
}
