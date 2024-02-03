function sanitizeString(string){
    const regex = /^SPECIES_|^TYPE_|^ABILITY_|^MOVE_|^SPLIT_|FLAG_|^EFFECT_|^Z_EFFECT_|^ITEM_|^EGG_GROUP_|^EVO_|^NATURE_/ig

    const unsanitizedString = string.toString().replace(regex, "")
    let matchArray = unsanitizedString.match(/\w+/g)
    if(matchArray){
        for (i = 0; i < matchArray.length; i++){
            matchArray[i] = matchArray[i].split('_')
            for (j = 0; j < matchArray[i].length; j++){
                matchArray[i][j] = matchArray[i][j][0].toUpperCase() + matchArray[i][j].slice(1).toLowerCase()
            }
            matchArray[i] = matchArray[i].join(" ")
        }
        return matchArray.join(" ")
    }
    else
        return unsanitizedString
}








async function fetchData(urlParams = ""){
    setTimeout(() => {
        timeout = true
    }, "20000");

    if(urlParams == ""){
        history.pushState(null, null, location.href)
        const queryString = window.location.search
        urlParams = new URLSearchParams(queryString)
    }
    await forceUpdate()

    await fetchMovesObj()
    await fetchAbilitiesObj()
    await fetchSpeciesObj()
    await fetchLocationsObj()
    await fetchTrainersObj()
    await fetchStrategiesObj()
    
    await fetchTypeChart()

    /*
    footerP("setDataList")
    await setDataList()
    footerP("setFilters")
    await setFilters()
    */
    footerP("displaySetup")
    await displaySetup()
    footerP("displayParams")
    await displayParams(urlParams)

    await window.scrollTo(0, 0)
}


async function fetchTypeChart(){
    footerP("Fetching type chart")
    window.typeChart = {}
    try{
        let typeChartUrl = "https://raw.githubusercontent.com/ydarissep/dex-core/main/src/typeChart.json"
        if(typeof repoTypeChartUrl !== "undefined"){
            typeChartUrl = repoTypeChartUrl
        }
        let rawTypeChart = await fetch(typeChartUrl)
        typeChart = await rawTypeChart.json()
    }
    catch(e){
        console.log(e.message)
        console.log(e.stack)
        typeChart = backupData[6]
    }
}




async function forceUpdate(){
    if(localStorage.getItem("update") != `${checkUpdate}`){
        await localStorage.clear()
        await localStorage.setItem("update", `${checkUpdate}`)
        await footerP("Fetching data please wait... this is only run once")
    }
}




function exportData(){
    console.log(`let backupData = [${JSON.stringify(moves)}, ${JSON.stringify(abilities)}, ${JSON.stringify(species)}, ${JSON.stringify(locations)}, ${JSON.stringify(trainers)}, ${JSON.stringify(strategies)}, ${JSON.stringify(typeChart)}]`)
}



function footerP(input){
    if(input === "")
        document.querySelectorAll("#footer > p").forEach(paragraph => paragraph.remove())

    const paragraph = document.createElement("p")
    const footer = document.getElementById("footer")
    paragraph.innerText = input
    footer.append(paragraph)
}



function checkTimeout(){
    if(timeout){
        throw new Error("Timed out")
    }
}




function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    // to avoid breaking orgain page when copying more words
    // cant copy when adding below this code
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}




function getTextWidth(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.font = getComputedStyle(document.body).font;

    return context.measureText(text).width;
}





function setDataList(){
    window.speciesIngameNameArray = []
    for(const name in species){
        if(species[name]["baseSpeed"] <= 0){
            continue
        }
        const option = document.createElement("option")
        option.innerText = sanitizeString(name)
        speciesIngameNameArray.push(option.innerText)
        speciesPanelInputSpeciesDataList.append(option)
    }

    window.abilitiesIngameNameArray = []
    for(const abilityName in abilities){
        if(!abilities[abilityName]["description"] || !/[1-9aA-zZ]/.test(abilities[abilityName]["ingameName"])){
            continue
        }
        const option = document.createElement("option")
        option.innerText = abilities[abilityName]["ingameName"]
        abilitiesIngameNameArray.push(option.innerText)
        abilitiesInputDataList.append(option)
    }
}





function getSpeciesSpriteSrc(speciesName){
    if(sprites[speciesName]){
        if(sprites[speciesName].length < 500){
            localStorage.removeItem(speciesName)
            spriteRemoveBgReturnBase64(speciesName, species)
            return species[speciesName]["sprite"]
        }
        else{
            return sprites[speciesName]
        }
    }
    else{
        spriteRemoveBgReturnBase64(speciesName, species)
        return species[speciesName]["sprite"]
    }
}










async function refreshURLParams(){
    const url = document.location.href.split("?")[0] + "?"
    let params = ""

    if(!speciesPanelMainContainer.classList.contains("hide")){
        params += `species=${panelSpecies}&`
    }
    if(document.getElementsByClassName("activeTable").length > 0){
        params += `table=${document.getElementsByClassName("activeTable")[0].id}&`
    }
    if(document.getElementsByClassName("activeFilter")[0].getElementsByClassName("filter").length > 0){
        params += "filter="
        const filters = document.getElementsByClassName("activeFilter")[0].getElementsByClassName("filter")
        for(let i = 0, j = filters.length; i < j; i++){
            if(!/>|<|=/.test(filters[i].innerText)){
                let param = filters[i].innerText.split(":")
                params += `${param[0]}:${param[1].trim()}`
                if(i !== j - 1){
                    params += ","
                }
            }
        }
        params += "&"
    }
    if(document.getElementsByClassName("activeInput")[0].value !== ""){
        params += `input=${document.getElementsByClassName("activeInput")[0].value}&`
    }
    
    await getHistoryState()
    window.history.replaceState(`${url}${params}`, null, `${url}${params}`)
    return `${url}${params}`, null, `${url}${params}`
}








async function displayParams(urlParams){
    if(urlParams.get("species")){
        scrollToSpecies = urlParams.get("species")
        createSpeciesPanel(scrollToSpecies)
    }
    else{
        speciesPanel("hide")
    }
    if(urlParams.get("table")){
        await tableButtonClick(document.getElementById(urlParams.get("table")).id.replace("Table", ""))
    }
    if(urlParams.get("filter")){
        urlParams.get("filter").split(",").forEach(filter => {
            createFilter(filter.split(":")[1], filter.split(":")[0])
        })
    }
    if(urlParams.get("input")){
        document.getElementsByClassName("activeInput")[0].value = urlParams.get("input")
        document.getElementsByClassName("activeInput")[0].dispatchEvent(new Event("input"))
    }
    
    await refreshURLParams()
}







async function getHistoryState(){
    let historyStateObj = {}
    if(!speciesPanelMainContainer.classList.contains("hide")){
        historyStateObj["species"] = panelSpecies
    }
    if(document.getElementsByClassName("activeTable").length > 0){
        historyStateObj["table"] = document.getElementsByClassName("activeTable")[0].id
    }
    if(document.getElementsByClassName("filter").length > 0){
        historyStateObj["filter"] = {}
        const filters = document.getElementsByClassName("filter")
        for(let i = 0, j = filters.length; i < j; i++){
            const table = filters[i].parentElement.id.replace("FilterContainer", "")
            if(!(table in historyStateObj["filter"])){
                historyStateObj["filter"][table] = []
            }
            historyStateObj["filter"][table].push(filters[i].innerText)
        }
    }

    if(JSON.stringify(historyObj.slice(-1)[0]) !== JSON.stringify(historyStateObj)){
        historyObj.push(historyStateObj)
    }
}







async function displayHistoryObj(historyStateObj){
    deleteFiltersFromTable()
    if(historyStateObj){
        if("species" in historyStateObj){
            scrollToSpecies = historyStateObj["species"]
            await createSpeciesPanel(scrollToSpecies)
            window.scrollTo(0, 0)
        }
        else{
            speciesPanel("hide")
        }
        if("table" in historyStateObj){
            await tableButtonClick(historyStateObj["table"].replace("Table", ""))

            deleteFiltersFromTable()
            if("filter" in historyStateObj){
                Object.keys(historyStateObj["filter"]).forEach(key => {
                    if(key === historyStateObj["table"].replace("Table", "")){
                        for(filter of historyStateObj["filter"][key]){
                            if(!/>|<|=/.test(filter)){
                                createFilter(filter.split(":")[1].trim(), filter.split(":")[0])
                            }
                        }
                    }
                })
            }
        }
    }
}






function speciesCanLearnMove(speciesObj, moveName){
    const index = ["levelUpLearnsets", "eggMovesLearnsets", "TMHMLearnsets", "tutorLearnsets"]
    for(let i = 0; i < index.length; i++){
        if(index[i] in speciesObj){
            for(let j = 0; j < speciesObj[index[i]].length; j++){
                if(typeof(speciesObj[index[i]][j]) == "object"){
                    if(speciesObj[index[i]][j][0] == moveName){
                        if(index[i] === "levelUpLearnsets"){
                            return speciesObj[index[i]][j][1]
                        }
                        return index[i]
                    }
                }
                else if(typeof(speciesObj[index[i]][j] == "string")){
                    if(speciesObj[index[i]][j] == moveName){
                        return index[i]
                    }
                }
            }
        }
    }

    return false
}






function getPokemonResistanceValueAgainstType(speciesObj, type){
    if((speciesObj["type1"] !== speciesObj["type2"])){
        if(typeof speciesObj["type3"] !== "undefined"){
            if(speciesObj["type3"] !== speciesObj["type1"] && speciesObj["type3"] !== speciesObj["type2"]){
                return typeChart[type][speciesObj["type1"]] * typeChart[type][speciesObj["type2"]] * typeChart[type][speciesObj["type3"]]
            }
        }
        else{
            return typeChart[type][speciesObj["type1"]] * typeChart[type][speciesObj["type2"]]
        }
    }
    else{
        if(typeof speciesObj["type3"] !== "undefined"){
            if(speciesObj["type3"] !== speciesObj["type1"] && speciesObj["type3"] !== speciesObj["type2"]){
                return typeChart[type][speciesObj["type1"]] * typeChart[type][speciesObj["type3"]]
            }
        }
        else{
            return typeChart[type][speciesObj["type1"]]
        }
    }
}

function getPokemonEffectivenessValueAgainstType(speciesObj, type){
    let offensiveValue = typeChart[speciesObj["type1"]][type]
    if(typeChart[speciesObj["type2"]][type] > typeChart[speciesObj["type1"]][type]){
        offensiveValue = typeChart[speciesObj["type2"]][type]
    }
    if(typeof speciesObj["type3"] !== "undefined"){
        if(typeChart[speciesObj["type3"]][type] > typeChart[speciesObj["type1"]][type] && typeChart[speciesObj["type3"]][type] > typeChart[speciesObj["type2"]][type]){
            offensiveValue = typeChart[speciesObj["type3"]][type]
        }
    }

    return offensiveValue
}
