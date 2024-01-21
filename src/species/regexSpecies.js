function regexSpecies(textSpecies, species){
    const lines = textSpecies.split("\n")
    let formsStart = 0, gen9Start = 0, gigaStart = 0, customStart = 0, ID = 0, conversionTable = []

    lines.forEach(line => {
        if(/FORMS_START/i.test(line) && !formsStart){
            formsStart = ID
        }
        else if(/GEN9_START/i.test(line) && !gen9Start){
            gen9Start = formsStart + ID
        }
        else if(/GIGANTAMAX_START/i.test(line) && !gigaStart){
            gigaStart = gen9Start + ID
        }
        else if(/CUSTOM_START/i.test(line) && !customStart){
            customStart = gigaStart + ID
        }

        const matchSpecies = line.match(/#define *(SPECIES_\w+)/i)
        if(matchSpecies){
            const name = matchSpecies[1]


            const matchSpeciesID = line.trim().match(/SPECIES_\w+$/i)
            if(matchSpeciesID){
                conversionTable[name] = matchSpeciesID[0]
            }
            else{
                const matchInt = line.trim().match(/\d+$/)
                if(matchInt){
                    ID = parseInt(matchInt[0])
                }
            }

            species[name] = {}
            species[name]["name"] = name

            species[name]["ID"] = Math.max(formsStart, gen9Start, gigaStart, customStart) + ID
        }
    })
    
    for(speciesName in conversionTable){
        species[speciesName]["ID"] = species[conversionTable[speciesName]]["ID"]
    }

    return species
}









function regexBaseStats(textBaseStats, species){
    const lines = textBaseStats.split("\n")

    const regex = /baseHP|baseAttack|baseDefense|baseSpeed|baseSpAttack|baseSpDefense|type1|type2|item1|item2|eggGroup1|eggGroup2/i //removed |abilities|innates at the end
    let stop = false, value, name

    lines.forEach(line => {

        if(/#else/i.test(line))
                stop = true
        if(/#endif/i.test(line))
                stop = false


        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies){
            name = matchSpecies[0]
            change = false
        }


        const matchRegex = line.match(regex)
        if(matchRegex){
            const match = matchRegex[0]



            if(match === "baseHP" || match === "baseAttack" || match === "baseDefense" || match === "baseSpeed" || match === "baseSpAttack" || match === "baseSpDefense"){
                const matchInt = line.match(/\d+/)
                if(matchInt)
                    value = parseInt(matchInt[0])
            }
            else if(match === "type1" || match === "type2" || match === "item1" || match === "item2" || match === "eggGroup1" || match === "eggGroup2"){
                value = line.match(/\w+_\w+/i)
                if(value)
                    value = value[0]
            }
            /*
            else if(match === "abilities"){
                value = line.match(/ABILITY_\w+/ig)
                if(value){
                    for (let i = 0; i < 3; i++){
                        if(value[i] === "ABILITY_NONE" || value[i] === undefined && i >= 1)
                            value[i] = value[i-1]
                    }
                }
            }
            else if(match === "innates")
            {
                let innates = []
                value = line.match(/ABILITY_\w+/ig)
                if(value){
                    value.forEach(innate => {
                        if(innate != "ABILITY_NONE"){
                            innates.push(innate)
                        }
                    })
                    value = innates
                }
            }
            */



            if(!stop){
                species[name][match] = value
            }
        }
    })
    return getBST(species)
}





















function regexChanges(textChanges, species){
    const lines = textChanges.split("\n")

    const regex = /baseHP|baseAttack|baseDefense|baseSpeed|baseSpAttack|baseSpDefense|types/i
    let stop = false, value, name, defines = {}, define = "", keep = false, argument = [], argumentDefine = []

    for(let i = 0; i < lines.length; i++){
        const line = lines[i].trim()

        if(/#else/i.test(line))
                stop = true
        if(/#endif/i.test(line))
                stop = false


        if(!stop){
            if(/#define/.test(line) || keep){
                const matchDefine = line.match(/#define (.*)/i)
                if(matchDefine){
                    if(!/\\/.test(line)){
                        Object.keys(defines).forEach(testDefine => {
                            const tempDefine = testDefine.match(/(\w+)/)
                            if(tempDefine[1] && line.includes(tempDefine[1])){
                                define = matchDefine[1].replace(testDefine, "").trim()
                                defines[define] = defines[testDefine]
                            }
                        })
                    }
                    else{
                        define = matchDefine[1].replaceAll("\\", "").trim()
                        defines[define] = []
                    }
                }
                else if(keep && define in defines){
                    defines[define].push(line)
                }
                if(/\\/.test(line)){
                    keep = true
                }
                else{
                    keep = false
                }
            }
            else{
                const matchSpecies = line.match(/\[(SPECIES_\w+)\] *=(.*)/i)
                if(matchSpecies){
                    name = matchSpecies[1]
                    stop = false
                    argument = []
                    argumentDefine = []

                    if(matchSpecies[2]){
                        matchDefine = matchSpecies[2].replaceAll(",", "").trim().match(/(\w+)(.*)/)
                        define = matchDefine[1]
                        if(matchDefine[2]){
                            argument = matchDefine[2].match(/\w+/g)
                        }
                        Object.keys(defines).forEach(testDefine => {
                            testDefine = testDefine.match(/(\w+)(.*)/)
                            if(testDefine[1] && testDefine[1] === define){
                                define = testDefine[0]
                                if(testDefine[2]){
                                    argumentDefine = testDefine[2].match(/\w+/g)
                                }
                            }
                        })
                        if(define in defines){
                            for(let j = 0; j < defines[define].length; j++){
                                let newLine = defines[define][j].replaceAll(" ", "").replaceAll("}", ",")
                                if(argument){
                                    for(let k = 0; k < argument.length; k++){
                                        newLine = newLine.replace(`${argumentDefine[k]},`, `${argument[k]},`)
                                    }
                                }   
                                lines.splice(i+1, 0, newLine)
                            }
                        }
                    }
                }

                if(/^\w+/.test(line.trim())){
                    define = ""
                    Object.keys(defines).forEach(testDefine => {
                        const tempDefine = testDefine.match(/(\w+)/)
                        if(tempDefine[1] && line.includes(tempDefine[1])){
                            define = testDefine
                        }
                    })
                    if(define in defines){
                        for(let j = 0; j < defines[define].length; j++){
                            lines.splice(i+1, 0, defines[define][j])
                        }
                    }
                }


                const matchRegex = line.match(regex)

                if(matchRegex && !stop){
                    let match = matchRegex[0]



                    if(match === "baseHP" || match === "baseAttack" || match === "baseDefense" || match === "baseSpeed" || match === "baseSpAttack" || match === "baseSpDefense"){
                        const matchInt = line.match(/\d+/g)
                        if(matchInt){
                            if(matchInt.length > 1){
                                value = parseInt(matchInt[1])
                            }
                            else{
                                value = parseInt(matchInt[0])
                            }
                        }
                    }
                    else if(match === "types"){
                        value = line.match(/TYPE_\w+/ig)
                        if(typeof value[0] !== 'undefined' && name in species){
                            if(value[0] !== species[name]["type1"]){
                                species[name]["changes"].push(["type1", value[0]])
                            }
                        }
                        if(typeof value[1] !== 'undefined' && name in species){
                            if(value[1] !== species[name]["type2"]){
                                species[name]["changes"].push(["type2", value[1]])
                            }
                        }
                    }

                    if(name in species){
                        if(match in species[name] && JSON.stringify(species[name][match]) != JSON.stringify(value)){
                            species[name]["changes"].push([match, value])
                        }   
                    }
                }
            }
        }
    }
    return species
}






















function getlevelUpAbilitiesLearnsetsConversionTable(textlevelUpAbilitiesLearnsetsPointers){
    const lines = textlevelUpAbilitiesLearnsetsPointers.split("\n")
    let conversionTable = {}

    lines.forEach(line => {

        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies){
            const value = matchSpecies[0]

            const matchConversion = line.match(/s\w+levelUpAbilityLearnset/i)
            if(matchConversion){
                const index = matchConversion[0]

                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [value]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(value)
            }
        }
    })
    return conversionTable
}

function regexlevelUpAbilitiesLearnsets(textlevelUpAbilitiesLearnsets, conversionTable, species){
    const lines = textlevelUpAbilitiesLearnsets.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchConversion = line.match(/s\w+levelUpAbilityLearnset/i)
        if(matchConversion){
            const index = matchConversion[0]
            speciesArray = conversionTable[index]
        }

        const matchLevelAbility = line.match(/(\d+) *, *(ABILITY_\w+) *, *(\w+) *, *(\w+) *, *(ABILITY_\w+) *, *(ABILITY_\w+) *, *(ABILITY_\w+) *, *(ABILITY_\w+)/i)
        if(matchLevelAbility && matchLevelAbility.length >= 9){
            const levelUpAbility = [matchLevelAbility[1], matchLevelAbility[2], matchLevelAbility[3], matchLevelAbility[4], matchLevelAbility[5], matchLevelAbility[6], matchLevelAbility[7], matchLevelAbility[8]]
            if(speciesArray)
            {
                for(let i = 0; i < speciesArray.length; i++){
                    if(!species[speciesArray[i]]["levelUpAbilities"].find((levelUpAbilities) => levelUpAbilities[1] == levelUpAbility[1])){
                        species[speciesArray[i]]["levelUpAbilities"].push(levelUpAbility)
                    }
                }
            }
        }
    })
    return species
}







function regexTutorAbilities(textTutorAbilities, species){
    const lines = textTutorAbilities.split("\n")
    let conversionTable = {}, speciesArray = []

    textTutorAbilities.match(/\[ *(SPECIES_\w+)\ *] * = *(s\w+TutorAbility)/ig).forEach(matchTutorAbilities => {
        const matchTutorAbility = matchTutorAbilities.match(/s\w+TutorAbility/i)[0]
        const matchSpecies = matchTutorAbilities.match(/SPECIES_\w+/)[0]
        if(conversionTable[matchTutorAbility]){
            conversionTable[matchTutorAbility].push(matchSpecies)
        }
        else{
            conversionTable[matchTutorAbility] = [matchSpecies]
        }
    })

    lines.forEach(line => {
        const matchConversion = line.match(/s\w+TutorAbility/i)
        if(matchConversion){
            const index = matchConversion[0]
            speciesArray = conversionTable[index]
        }

        const matchTutorAbility = line.match(/TUTOR.*\((\w+)\)/i)
        if(matchTutorAbility){
            if(speciesArray)
            {
                for(let i = 0; i < speciesArray.length; i++){
                    species[speciesArray[i]]["tutorAbilities"].push(`ABILITY_${matchTutorAbility[1]}`)
                }
            }
        }
    })
    return species
}










function getLevelUpLearnsetsConversionTable(textLevelUpLearnsetsPointers){
    const lines = textLevelUpLearnsetsPointers.split("\n")
    let conversionTable = {}

    lines.forEach(line => {

        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies){
            const value = matchSpecies[0]


            const matchConversion = line.match(/s\w+LevelUpLearnset/i)
            if(matchConversion){
                const index = matchConversion[0]

                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [value]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(value)
            }
        }
    })
    return conversionTable
}

function regexLevelUpLearnsets(textLevelUpLearnsets, conversionTable, species){
    const lines = textLevelUpLearnsets.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchConversion = line.match(/s\w+LevelUpLearnset/i)
        if(matchConversion){
            const index = matchConversion[0]
            speciesArray = conversionTable[index]
        }

        const matchLevelMove = line.match(/(\d+) *, *(MOVE_\w+)/i)
        if(matchLevelMove){
            const level = parseInt(matchLevelMove[1])
            const move = matchLevelMove[2]
            if(speciesArray)
            {
                for(let i = 0; i < speciesArray.length; i++)
                    species[speciesArray[i]]["levelUpLearnsets"].push([move, level])
            }
        }
    })
    return species
}










function getTMHMLearnsetsConversionTable(textTMHMLearnsetsPointers){
    const lines = textTMHMLearnsetsPointers.split("\n")
    let conversionTable = {}

    lines.forEach(line => {

        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies){
            const value = matchSpecies[0]


            const matchConversion = line.match(/s\w+TMHMLearnset/i)
            if(matchConversion){
                const index = matchConversion[0]


                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [value]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(value)
            }
        }
    })
    return conversionTable
}



function regexTMHMLearnsets(textTMHMLearnsets, conversionTable, species){
    const lines = textTMHMLearnsets.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchConversion = line.match(/s\w+TMHMLearnset/i)
        if(matchConversion){
            const index = matchConversion[0]
            if(index in conversionTable){
                speciesArray = conversionTable[index]
            }
        }


        const matchTmhmMove = line.match(/TMHM\d* *\((\w+ *\d+) *_ *(\w+)/i)
        if(matchTmhmMove){
            const TMHM = matchTmhmMove[1]
            let move = matchTmhmMove[2]
            if(move === "SOLARBEAM")
                move = "SOLAR_BEAM"
            else if(move === "SWAMPY_TERRAIN"){
                move = "SWAMP_TERRAIN"
            }
            move = `MOVE_${move}`


            for(let i = 0; i < speciesArray.length; i++)
                species[speciesArray[i]]["TMHMLearnsets"].push(move)
        }
    })
    return altFormsLearnsets(species, "forms", "TMHMLearnsets")
}









function regexEvolution(textEvolution, species){
    const lines = textEvolution.split("\n")
    let name

    lines.forEach(line =>{

        const matchSpecies = line.match(/\[ *(SPECIES_\w+) *\]/i)
        if(matchSpecies)
            name = matchSpecies[1]



        const matchEvoInfo = line.match(/(\w+), *(\w+), *(\w+)/)
        if(matchEvoInfo){
            const method = matchEvoInfo[1]
            const condition = matchEvoInfo[2]
            const targetSpecies = matchEvoInfo[3]
            species[name]["evolution"].push([method, condition, targetSpecies])
        }
    })


    return getEvolutionLine(species)
}

async function getEvolutionLine(species){
    for (const name of Object.keys(species)){
        let evolutionLine = [name]

        for(let i = 0; i < evolutionLine.length; i++){
            const targetSpecies = evolutionLine[i]
            for(let j = 0; j < species[evolutionLine[i]]["evolution"].length; j++){
                const targetSpeciesEvo = species[targetSpecies]["evolution"][j][2]
                if(!evolutionLine.includes(targetSpeciesEvo)){
                    evolutionLine.push(targetSpeciesEvo)
                }
            }
        }

        for(let i = 0; i < evolutionLine.length; i++){
            const targetSpecies = evolutionLine[i]
            if(evolutionLine.length > species[targetSpecies]["evolutionLine"].length){
                species[targetSpecies]["evolutionLine"] = evolutionLine
            }
        }
    }

    for (const name of Object.keys(species)){
        species[name]["evolutionLine"] = Array.from(new Set(species[name]["evolutionLine"])) // remove duplicates
    }

    return species
}









function regexForms(textForms, species){
    const lines = textForms.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchSpecies = line.match(/SPECIES_\w+/i)
        
        if(/FORM_SPECIES_END/i.test(line)){
            for (let i = 0; i < speciesArray.length; i++)
                species[speciesArray[i]]["forms"] = speciesArray
            speciesArray = []
        }
        else if(matchSpecies){
            const name = matchSpecies[0]
            speciesArray.push(name)
        }
    })
    return species
}








function regexEggMovesLearnsets(textEggMoves, species){
    const lines = textEggMoves.split("\n")
    const speciesString = JSON.stringify(Object.keys(species))
    let name = null

    lines.forEach(line => {
        if(/egg_moves/i.test(line))
            name = null
        const matchMove = line.match(/MOVE_\w+/i)
        if(matchMove){
            const move = matchMove[0]
            if(name)
                species[name]["eggMovesLearnsets"].push(move)
        }
        else if(name === null){
            const matchLine = line.match(/(\w+),/i)
            if(matchLine){
                const testSpecies = `SPECIES_${speciesString.match(matchLine[1])}`
                if(speciesString.includes(testSpecies))
                    name = testSpecies
            }
        }
    })


    return altFormsLearnsets(species, "evolutionLine", "eggMovesLearnsets")
}









function getSpriteConversionTable(textFrontPicTable, species){
    const lines = textFrontPicTable.split("\n")
    const speciesString = JSON.stringify(Object.keys(species))
    let conversionTable = {}

    lines.forEach(line => {

        const matchConversionSpecies = line.match(/(\w+) *, *(gMonFrontPic_\w+)/i)
        if(matchConversionSpecies){

            const testSpecies = `SPECIES_${matchConversionSpecies[1]}`
            if(speciesString.includes(testSpecies)){
                const species = testSpecies
                const index = matchConversionSpecies[2]

                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [species]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(species)
            }
        }
    })

    if(!conversionTable["gMonFrontPic_Alcremie"]){
        conversionTable["gMonFrontPic_Alcremie"] = ["SPECIES_ALCREMIE"]
    }

    return conversionTable
}

function regexSprite(textSprite, conversionTable, species){
    const lines = textSprite.split("\n")
    const conversionTableString = JSON.stringify(Object.keys(conversionTable))

    lines.forEach(line => {
        const matchgMonFrontPic = line.match(/gMonFrontPic_\w+/i)
        if(matchgMonFrontPic){

            const conversion = matchgMonFrontPic[0]
            if(conversionTableString.includes(conversion)){
                const speciesArray = conversionTable[conversion]

                const matchPath = line.match(/graphics\/pokemon\/(.*?)\./i)
                if(matchPath){
                    let path = matchPath[1]
                    let url = `https://raw.githubusercontent.com/${repo}/graphics/pokemon/${path}.png`
                    for(let i = 0; i < conversionTable[conversion].length; i++){
                        species[speciesArray[i]]["sprite"] = url
                        spriteRemoveBgReturnBase64(speciesArray[i], species)
                    }
                }
            }
        }
    })
    return species
}












function getTutorLearnsetsConversionTable(textTutorLearnsetsPointers){
    const lines = textTutorLearnsetsPointers.split("\n")
    let conversionTable = {}

    lines.forEach(line => {

        const matchSpecies = line.match(/SPECIES_\w+/i)
        if(matchSpecies){
            const value = matchSpecies[0]


            const matchConversion = line.match(/s\w+TutorLearnset/i)
            if(matchConversion){
                const index = matchConversion[0]


                if(conversionTable[index] === undefined) // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index] = [value]
                else // DO NOT TOUCH THAT FUTURE ME, THIS IS THE WAY, DON'T QUESTION ME
                    conversionTable[index].push(value)
            }
        }
    })
    return conversionTable
}



function regexTutorLearnsets(textTutorLearnsets, conversionTable, species){
    const lines = textTutorLearnsets.split("\n")
    let speciesArray = []

    lines.forEach(line => {
        const matchConversion = line.match(/s\w+TutorLearnset/i)
        if(matchConversion){
            const index = matchConversion[0]
            if(index in conversionTable){
                speciesArray = conversionTable[index]
            }
        }


        const matchTutorMove = line.match(/TUTOR *\( *(\w+) *\)/i)
        if(matchTutorMove){
            let move = matchTutorMove[1]
            move = `MOVE_${move}`

            for(let i = 0; i < speciesArray.length; i++){
                species[speciesArray[i]]["tutorLearnsets"].push(move)
            }
        }
    })
    return altFormsLearnsets(species, "forms", "tutorLearnsets")
}















function altFormsLearnsets(species, input, output){
    for (const name of Object.keys(species)){

        if(species[name][input].length >= 2){

                for (let j = 0; j < species[name][input].length; j++){
                    const targetSpecies = species[name][input][j]
                    

                    if(species[targetSpecies][output].length <= 0){
                        species[targetSpecies][output] = species[name][output]
                    }
                }
        }
    }
    return species
}


function getBST(species){
    for (const name of Object.keys(species)){
        const baseHP = species[name]["baseHP"]
        const baseAttack = species[name]["baseAttack"]
        const baseDefense = species[name]["baseDefense"]
        const baseSpAttack = species[name]["baseSpAttack"]
        const baseSpDefense = species[name]["baseSpDefense"]
        const baseSpeed = species[name]["baseSpeed"]
        const BST = baseHP + baseAttack + baseDefense + baseSpAttack + baseSpDefense + baseSpeed

        species[name]["BST"] = BST

    }
    return species
}