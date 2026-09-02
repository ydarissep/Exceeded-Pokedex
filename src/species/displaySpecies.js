fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/species/displaySpecies.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("function updateSpeciesMoveFilter", "function updateSpeciesMoveFilterOld")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})









function updateSpeciesMoveFilter(sortTable = false){
    speciesMoveFilter = null
    const abilityFiltersContainer = speciesFilterContainer.getElementsByClassName("speciesFilterAbilityContainer")[0]
    const moveFiltersContainer = speciesFilterContainer.getElementsByClassName("speciesFilterMoveContainer")[0]

    if (moveFiltersContainer && typeof abilityFiltersContainer === "undefined"){
        const filters = moveFiltersContainer.getElementsByClassName("filter")
        if (filters.length == 1){
            if (filters[0].parentNode.children[0].value != "NOT"){
                speciesMoveFilter = filters[0].innerText.replace(" ", "").split(":")[1]
                Object.keys(moves).forEach(moveName => {
                    if(moves[moveName]["ingameName"] === speciesMoveFilter){
                        speciesMoveFilter = moveName
                        if (sortTable){
                            sortTableByLearnsets(true)
                        }
                    }
                })
            }
        }
    }
    else if (abilityFiltersContainer && typeof moveFiltersContainer === "undefined"){
        const filters = abilityFiltersContainer.getElementsByClassName("filter")
        if (filters.length == 1){
            if (filters[0].parentNode.children[0].value != "NOT"){
                speciesMoveFilter = filters[0].innerText.replace(" ", "").split(":")[1]
                Object.keys(abilities).forEach(abilityName => {
                    if(abilities[abilityName]["ingameName"] === speciesMoveFilter){
                        speciesMoveFilter = abilityName
                        if (sortTable){
                            sortTableByLearnsets(true)
                        }
                    }
                })
            }
        }
    }
}