fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/utility.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("function speciesCanLearnMove", "function speciesCanLearnMoveOld")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})






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

    for (let i = 0; i < speciesObj["levelUpAbilities"].length; i++){
        if (speciesObj["levelUpAbilities"][i][1] == moveName){
            if(!isNaN(speciesObj["levelUpAbilities"][i][0])){
                return parseInt(speciesObj["levelUpAbilities"][i][0])
            }
        }
    }

    for (let i = 0; i < speciesObj["tutorAbilities"].length; i++){
        if (speciesObj["tutorAbilities"][i] == moveName){
            return "tutorLearnsets"
        }
    }

    return false
}