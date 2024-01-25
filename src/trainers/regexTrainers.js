async function regexScripts(textScripts, trainers){
    let scripts = textScripts.match(/data\/maps\/.*\/scripts.inc/ig)

    for(let i = 0, j = scripts.length; i < j; i++){
        if(scripts[i] === "data/maps/RuinsOfAlph_InnerChamber/scripts.inc"){
            scripts[i] = "data/maps/RuinsofAlph_InnerChamber/scripts.inc"
        }
        fetch(`https://raw.githubusercontent.com/${repo}/${scripts[i].replace("data/", "")}`)
        .then(promises => {
            promises.text()
            .then(text => {
                const zone = scripts[i].match(/data\/maps\/(.*)\/scripts.inc/i)[1].replaceAll("_", "").replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").trim()
                const trainersFromScript = Array.from(new Set(text.match(/TRAINER_\w+/g)))

                for(let k = 0; k < trainersFromScript.length; k++){
                    const trainer = trainersFromScript[k]
                    if(!trainers[zone]){
                        trainers[zone] = {}
                    }
                    if(!trainers[zone][trainer]){
                        trainers[zone][trainer] = {}
                        initTrainer(trainers, trainer, zone)
                    }   
                }
            })
        })
    }

    return trainers
}




async function regexTrainers(textTrainers, trainers){
    const lines = textTrainers.split("\n")
    let comment = false, trainer = null, zone = null, conversionTable = {}, trainerToZone = {}

    Object.keys(trainers).forEach(zone => {
        Object.keys(trainers[zone]).forEach(trainer => {
            trainerToZone[trainer] = zone
        })
    })

    const rawRematch = await fetch(`https://raw.githubusercontent.com/${repo}/battle_setup.c`)
    const textRematch = await rawRematch.text()

    let trainerToRematch = {}
    const rematches = textRematch.match(/REMATCH\(TRAINER_\w+, TRAINER_\w+, TRAINER_\w+, TRAINER_\w+/ig)
    rematches.forEach(rematch => {
        const trainerMatch = rematch.match(/TRAINER_\w+/ig)
        for(let i = 1; i < trainerMatch.length; i++){
            if(trainerMatch[i] !== trainerMatch[0]){
                trainerToRematch[trainerMatch[i]] = trainerMatch[0]
            }
        }
    })

    lines.forEach(line => {
        line = line.trim()
        if(/\/\*/.test(line)){
            comment = true
        }
        if(/\*\//.test(line)){
            comment = false
        }
        
        if(!comment && !/^\/\//.test(line)){
            if(/\[ *TRAINER_\w+ *\]/i.test(line)){
                trainer = line.match(/TRAINER_\w+/i)[0]
                zone = trainerToZone[trainer]
                if(trainerToRematch[trainer]){
                    const rematch = trainerToRematch[trainer]
                    if(!zone){
                        zone = trainerToZone[rematch]
                    }
                    if(trainer && zone && rematch){
                        if(!trainers[zone][rematch]["rematchArray"]){
                            trainers[zone][rematch]["rematchArray"] = []
                        }
                        try{
                            trainers[zone][trainer]["rematch"] = rematch
                        }
                        catch{
                            trainers[zone][trainer] = {}
                            initTrainer(trainers, trainer, zone)
                            trainers[zone][trainer]["rematch"] = rematch
                            trainerToZone[trainer] = zone
                        }
                        trainers[zone][rematch]["rematchArray"].push(trainer)
                    }
                }
            }
            if(zone && trainers[zone][trainer]){
                if(/.trainerPic *=/i.test(line)){
                    const matchTrainerPic = line.match(/TRAINER_PIC_\w+/i)
                    if(matchTrainerPic){
                        trainers[zone][trainer]["sprite"] = matchTrainerPic[0]
                    }
                }
                else if(/.trainerName *=/i.test(line)){
                    const matchTrainerName = line.match(/_\(\"(.*)\"\)/i)
                    if(matchTrainerName){
                        trainers[zone][trainer]["ingameName"] = matchTrainerName[1]
                        if(/\{.*RIVAL_NAME\}/i.test(trainers[zone][trainer]["ingameName"])){
                            trainers[zone][trainer]["ingameName"] = "Rival"
                        }
                    }
                }
                /*
                else if(/.items/i.test(line)){
                    const matchItems = line.match(/ITEM_\w+/g)
                    if(matchItems){
                        trainers[zone][trainer]["items"] = matchItems
                    }
                    else{
                        trainers[zone][trainer]["items"] = []
                    }
                }
                */
                else if(/.doubleBattle *=/i.test(line)){
                    if(/TRUE *,/i.test(line)){
                        trainers[zone][trainer]["double"] = true
                    }
                }
                else if(/.hardParty *=/i.test(line)){
                    const matchParty = line.match(/sParty_\w+/i)
                    if(matchParty){
                        conversionTable[matchParty[0]] = trainer
                    }
                }
                else if(/.party *=/i.test(line)){
                    const matchParty = line.match(/sParty_\w+/i)
                    if(matchParty){
                        conversionTable[matchParty[0]] = trainer
                    }
                }
                else if(/^} *,$/.test(line)){
                    trainer = null
                    zone = null
                }
            }
        }

    })

    return [trainers, conversionTable, trainerToZone]
}



async function regexTrainersParties(textTrainersParties, [trainers, conversionTable, trainerToZone]){

    


    const lines = textTrainersParties.split("\n")
    let comment = false, trainer = null, zone = null, difficulty = "Normal", mon = {}, EVs = [0, 0, 0, 0, 0, 0]

    lines.forEach(line => {
        line = line.trim()

        if(/\/\*/.test(line) || line === "/*"){
            comment = true
        }
        if(/[^\/]\*\//.test(line) || line === "*/"){
            comment = false
        }
        
        if((!comment && !/^\/\//.test(line))){
            if(/sParty_\w+/i.test(line)){
                const party = line.match(/sParty_\w+/)[0]
                if(conversionTable[party]){
                    trainer = conversionTable[party]
                    zone = trainerToZone[trainer]
                    if(/Hard$/.test(party)){
                        difficulty = "Hard"
                    }
                }
            }
            if(zone && trainers[zone][trainer]){
                if(/.lvl *=/i.test(line)){
                    const matchLvl = line.match(/-?\d+/)
                    if(matchLvl){
                        mon["lvl"] = matchLvl[0]
                    }
                }
                else if(/.species *=/i.test(line)){
                    const matchSpecies = line.match(/SPECIES_\w+/i)
                    if(matchSpecies){
                        mon["name"] = matchSpecies[0]
                    }
                }
                else if(/.heldItem *=/i.test(line)){
                    const matchItem = line.match(/ITEM_\w+/i)
                    if(matchItem){
                        mon["item"] = matchItem[0]
                    }
                }
                else if(/.iv *=/i.test(line)){
                    const matchIVs = line.match(/\d+/g)
                    if(matchIVs){
                        const IVs = Math.floor(matchIVs[0] * 31 / 255)
                        mon["ivs"] = [IVs, IVs, IVs, IVs, IVs, IVs]
                    }
                }
                else if(/.evHp *=/i.test(line)){
                    const matchEV = line.match(/\d+/)
                    if(matchEV){
                        EVs[0] = matchEV[0]
                    }
                }
                else if(/.evAtk *=/i.test(line)){
                    const matchEV = line.match(/\d+/)
                    if(matchEV){
                        EVs[1] = matchEV[0]
                    }
                }
                else if(/.evDef *=/i.test(line)){
                    const matchEV = line.match(/\d+/)
                    if(matchEV){
                        EVs[2] = matchEV[0]
                    }
                }
                else if(/.evSatk *=/i.test(line)){
                    const matchEV = line.match(/\d+/)
                    if(matchEV){
                        EVs[3] = matchEV[0]
                    }
                }
                else if(/.evSdef *=/i.test(line)){
                    const matchEV = line.match(/\d+/)
                    if(matchEV){
                        EVs[4] = matchEV[0]
                    }
                }
                else if(/.evSpd *=/i.test(line)){
                    const matchEV = line.match(/\d+/)
                    if(matchEV){
                        EVs[5] = matchEV[0]
                    }
                }
                else if(/.nature *=/i.test(line)){
                    const matchNature = line.match(/NATURE_\w+/i)
                    if(matchNature){
                        mon["nature"] = matchNature[0]
                    }
                }
                else if(/.moves *=/i.test(line)){
                    const matchMoves = line.match(/MOVE_\w+/ig)
                    if(matchMoves){
                        mon["moves"] = matchMoves
                    }
                }
                else if(/^} *,?$/.test(line)){
                    if(mon["lvl"] && mon["name"]){ 
                        if(!mon["item"]){
                            mon["item"] = "ITEM_NONE"
                        }
                        if(!mon["ability"]){
                            mon["ability"] = 0
                        }
                        if(!mon["ivs"]){
                            mon["ivs"] = [0]
                        }
                        if(!mon["evs"]){
                            mon["evs"] = EVs
                        }
                        if(!mon["nature"]){
                            mon["nature"] = "NATURE_DOCILE"
                        }
                        if(!mon["moves"]){
                            mon["moves"] = getWildPokemonLearnsets(mon["name"], mon["lvl"])
                        }
                        if(!trainers[zone][trainer]["party"][difficulty]){
                            trainers[zone][trainer]["party"][difficulty] = []
                        }
                        trainers[zone][trainer]["party"][difficulty].push(mon)
                    }
                    EVs = [0, 0, 0, 0, 0, 0]
                    mon = {}
                }
                else if(/^} *;$/.test(line)){
                    Object.keys(trainers[zone][trainer]["party"]).forEach(difficulty => {
                        trainers[zone][trainer]["party"][difficulty].forEach(trainerSpeciesObj => {
                            let speciesName = trainerSpeciesObj["name"]
                            for(let i = 0; i < species[speciesName]["evolution"].length; i++){
                                if(species[speciesName]["evolution"][i][0].includes("EVO_MEGA") && species[speciesName]["evolution"][i][1] == trainerSpeciesObj["item"]){
                                    trainerSpeciesObj["name"] = species[speciesName]["evolution"][i][2]
                                }
                            }
                        })
                    })
                    
                    trainer = null
                    zone = null
                    difficulty = "Normal"
                }
            }
        }
    })

    return trainers
}



function initTrainer(trainers, trainer, zone){
    trainers[zone][trainer]["sprite"] = ""
    trainers[zone][trainer]["ingameName"] = sanitizeString(trainer)
    trainers[zone][trainer]["items"] = []
    trainers[zone][trainer]["double"] = false
    trainers[zone][trainer]["party"] = {}
}




function getWildPokemonLearnsets(name, lvl){
    let validMoves = []
    let moves = []

    for(let i = 0, j = species[name]["levelUpLearnsets"].length; i < j; i++){
        if(species[name]["levelUpLearnsets"][i][1] > lvl){
            break
        }
        validMoves.push(species[name]["levelUpLearnsets"][i][0])
    }

    for(let i = validMoves.length, j = 0; i > 0 && j < 4; i--, j++){
        if(!moves.includes(validMoves[i - 1])){
            moves.push(validMoves[i - 1])
        }
    }

    return moves
}
