fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/tableFilters.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace(/(?<!function )filterSpeciesAbility/, "filterSpeciesAbilitiesLearnsets")

    eval.call(window,text)
}).catch(error => {
    footerP(error)
    console.warn(error)
})

function filterSpeciesAbilitiesLearnsets(value, label){
    let abilityName = null
    Object.keys(abilities).forEach(ability => {
        if(abilities[ability]["ingameName"] === value){
            abilityName = ability
        }
    })
    if(abilityName){
        for(let i = 0, j = tracker.length; i < j; i++){
            let name = tracker[i]["key"]
            if(tracker === locationsTracker){
                name = tracker[i]["key"].split("\\")[2]
            }
            if(!species[name]["levelUpAbilities"].find((levelUpAbility) => levelUpAbility[1] == abilityName)  && !species[name]["tutorAbilities"].includes(abilityName)){
                if(typeof innatesDefined !== "undefined"){
                    if(!species[name]["innates"].includes(abilityName)){
                        tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
                    }
                }
                else{
                    tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
                }
            }
        }
    }
}