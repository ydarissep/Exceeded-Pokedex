async function getScripts(trainers){
    footerP("Fetching trainers")
    const rawScripts = await fetch(`https://raw.githubusercontent.com/${repo}/event_scripts.s`)
    const textScripts = await rawScripts.text()

    return await regexScripts(textScripts, trainers)   
}

async function getTrainers(trainers){
    const rawTrainers = await fetch(`https://raw.githubusercontent.com/${repo}/trainers/trainers.h`)
    const textTrainers = await rawTrainers.text()

    const rawTrainersParties = await fetch(`https://raw.githubusercontent.com/${repo}/trainers/trainer_parties.h`)
    let textTrainersParties = await rawTrainersParties.text()

    const rawTrainersHard = await fetch(`https://raw.githubusercontent.com/${repo}/trainers/trainer_parties_hard.h`)
    textTrainersParties = textTrainersParties.concat(await rawTrainersHard.text())

    return await regexTrainersParties(textTrainersParties, await regexTrainers(textTrainers, trainers))
}

async function buildTrainersObj(){
    let trainers = {}
    
    trainers = await getScripts(trainers)
    trainers = await getTrainers(trainers)

    trainers = await bugFixTrainers(trainers)

    await localStorage.setItem("trainers", LZString.compressToUTF16(JSON.stringify(trainers)))
    return trainers
}


async function fetchTrainersObj(){
    if(!localStorage.getItem("trainers")){
        window.trainers = await buildTrainersObj()
    }
    else{
        window.trainers = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("trainers")))   
    }

    let counter = 0
    window.trainersTracker = []
    Object.keys(trainers).forEach(zone => {
        Object.keys(trainers[zone]).forEach(trainer => {
            trainersTracker[counter] = {}
            trainersTracker[counter]["key"] = `${zone}\\${trainer}`
            trainersTracker[counter]["filter"] = []
            counter++

            for(difficulty in trainers[zone][trainer]["party"]){
                if(difficulty !== "Normal" && !document.getElementById(`difficulty${difficulty}`)){
                    const newDifficulty = document.createElement("button"); newDifficulty.innerText = difficulty; newDifficulty.className = "setting"; newDifficulty.setAttribute("id", `difficulty${difficulty}`); newDifficulty.setAttribute("type", "button")
                    difficultyButtonContainer.append(newDifficulty)

                    newDifficulty.addEventListener("click", () => {
                        if(newDifficulty.classList.contains("activeSetting")){
                            trainersDifficulty = "Normal"
                            newDifficulty.classList.remove("activeSetting")
                        }
                        else{
                            for(const difficultyButton of difficultyButtonContainer.children){
                                difficultyButton.classList.remove("activeSetting")
                            }
                            newDifficulty.classList.add("activeSetting")
                            trainersDifficulty = newDifficulty.innerText
                        }
                        trainerSpeciesMatchFilter(true)
                        filterTrainersTableInput(trainersInput.value)
                    })
                }
            }

            const sprite = trainers[zone][trainer]["sprite"]
            if(localStorage.getItem(sprite)){
                sprites[sprite] = LZString.decompressFromUTF16(localStorage.getItem(sprite))
                if(sprites[sprite].length < 500){
                    localStorage.removeItem(sprite)
                    spriteRemoveBgReturnBase64(sprite)
                }
            }
        })
    })
}






function getTrainerSpriteSrc(trainerSprite){
    const url = `https://raw.githubusercontent.com/${repo}/trainers/front_pics/${trainerSprite.replace(/^TRAINER_PIC_/, "").toLowerCase()}_front_pic.png`
    if(sprites[trainerSprite]){
        if(sprites[trainerSprite].length < 500){
            localStorage.removeItem(trainerSprite)
            spriteRemoveTrainerBgReturnBase64(trainerSprite, url)
            return url
        }
        else{
            return sprites[trainerSprite]
        }
    }
    else{
        spriteRemoveTrainerBgReturnBase64(trainerSprite, url)
        return url
    }
}







async function bugFixTrainers(trainers){
    let trainerToZone = {}
    let stop = false
    let correctZone = false
    Object.keys(trainers).forEach(zone => {
        Object.keys(trainers[zone]).forEach(trainer => {
            if(!trainerToZone[trainer]){
                trainerToZone[trainer] = zone
            }
            else{
                const baseTrainerName = trainer.split("_").splice(0, 2).join("_")
                const fullTrainerName = trainer.split("_").slice(0, -1).join("_")
                Object.keys(trainers[zone]).forEach(trainerName => {
                    if(trainerName.split("_").splice(0, 2).join("_") == baseTrainerName && trainerName.split("_").slice(0, -1).join("_") != fullTrainerName){
                        correctZone = trainerToZone[trainer]
                        stop = true
                    }
                })
                if(!stop){
                    Object.keys(trainers[trainerToZone[trainer]]).forEach(trainerName => {
                        if(trainerName.split("_").splice(0, 2).join("_") == baseTrainerName && trainerName.split("_").slice(0, -1).join("_") != fullTrainerName){
                            correctZone = zone
                        }
                    })
                }
                stop = false
            }


            if(correctZone){
                if(correctZone === zone){
                    if(Object.keys(trainers[zone][trainer]["party"]).length === 0){
                        trainers[zone][trainer] = JSON.parse(JSON.stringify(trainers[trainerToZone[trainer]][trainer]))
                        delete trainers[trainerToZone[trainer]][trainer]
                    }
                }
                else{
                    if(Object.keys(trainers[trainerToZone[trainer]][trainer]["party"]).length === 0){
                        trainers[trainerToZone[trainer]][trainer] = JSON.parse(JSON.stringify(trainers[zone][trainer]))
                        delete trainers[zone][trainer]
                    }
                }
                correctZone = false
            }
        })
    })






    Object.keys(trainers).forEach(zone => {
        let rematchObj = {}
        let sortedZoneObj = {}
        Object.keys(trainers[zone]).sort(function(a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0
        }).forEach(trainer => {
            sortedZoneObj[trainer] = trainers[zone][trainer]
        })
        trainers[zone] = JSON.parse(JSON.stringify(sortedZoneObj))

        Object.keys(trainers[zone]).forEach(trainer => {
            if(trainers[zone][trainer]["rematch"]){
                rematchObj[trainer.split("_").slice(0, -1).join("_")] = trainers[zone][trainer]["rematch"]
            }
            else if(rematchObj[trainer.split("_").slice(0, -1).join("_")] && !trainers[zone][trainer]["rematch"]){
                trainers[zone][trainer]["rematch"] = rematchObj[trainer.split("_").slice(0, -1).join("_")]
                trainers[zone][rematchObj[trainer.split("_").slice(0, -1).join("_")]]["rematchArray"].push(trainer)

            }
            if(Object.keys(trainers[zone][trainer]["party"]).length === 0){
                try{
                    if(Object.keys(backupData[4][zone][trainer]["party"].length > 0)){
                        trainers[zone][trainer] = backupData[4][zone][trainer]
                        trainers[zone][trainer]["backup"] = true
                    }
                }
                catch{
                    if(trainers[zone][trainer]["rematch"]){
                        trainers[zone][trainers[zone][trainer]["rematch"]]["rematchArray"] = trainers[zone][trainers[zone][trainer]["rematch"]]["rematchArray"].filter(value => value !== trainer)
                    }
                    delete trainers[zone][trainer]
                }

                if(Object.keys(trainers[zone]).length === 0){
                    delete trainers[zone]
                }
            }
        })
    })

    return trainers
}