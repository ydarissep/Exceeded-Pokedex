function regexAbilities(textAbilities, abilities){
    const lines = textAbilities.split("\n")
    let conversionTable = {}

    for(let i = lines.length - 1; i >= 0; i--){
        let ability = lines[i].match(/(ABILITY_\w+)/i) //this is going to get confusing real quick :)
        if(ability){
            ability = ability[0]


            if(abilities[ability] === undefined){
                abilities[ability] = {}
                abilities[ability]["name"] = ability
                abilities[ability]["ID"] = 0
            }
            

            const matchAbilityIngameName = lines[i].match(/_ *\( *" *(.*)" *\) *,/i)
            if(matchAbilityIngameName){
                const abilityIngameName = matchAbilityIngameName[1]

                abilities[ability]["ingameName"] = abilityIngameName
            }
        }


        const matchConversionDescription = lines[i].match(/s\w+DescriptionExtended/i)
        if(matchConversionDescription){
            const conversionDescription = matchConversionDescription[0]



            if(ability){ // :=)


                if(conversionTable[conversionDescription] === undefined)
                    conversionTable[conversionDescription] = [ability]
                else
                    conversionTable[conversionDescription].push(ability)


            }
            else{
                const matchDescription = lines[i].match(/_ *\( *" *(.*)" *\) *;/i)
                if(matchDescription){
                    const description = matchDescription[1].replaceAll("-\\n", "").replaceAll("\\n", " ")
                    if(conversionTable[conversionDescription] !== undefined){
                        for(let j = 0; j < conversionTable[conversionDescription].length; j++)
                        abilities[conversionTable[conversionDescription][j]]["description"] = description
                    }
                }
            }
        }
    }
    return abilities
}








function regexAbilitiesID(textAbilitiesID, abilities){
    const lines = textAbilitiesID.split("\n")
    let conversionTableThreshold = {}, ID = 0

    lines.forEach(line => {
        const matchAbility = line.match(/#define *(ABILITY_\w+)/i)
        if (matchAbility){
            let name = matchAbility[1]
            if (name in abilities){
                ID = -1
                const matchAddInt = line.trim().match(/(\w+) *\+ *(\d+) *\)?/)
                if (matchAddInt){
                    if (matchAddInt[1] in conversionTableThreshold){
                        ID = parseInt(conversionTableThreshold[matchAddInt[1]]) + parseInt(matchAddInt[2])
                    }
                }
                else{
                    const matchInt = line.trim().match(/(\d+) *\)?/)
                    if (matchInt){
                        ID = parseInt(matchInt[1])
                    }
                }
                if (ID >= 0){
                    abilities[name]["ID"] = ID
                }
            }
        }
        else{
            const matchThreshold = line.trim().match(/#define (\w+) *\(? *?(\w+|\d+) *\)?/i)
            if (matchThreshold){
                conversionTableThreshold[matchThreshold[1]] = matchThreshold[2]
                if (matchThreshold[2] in conversionTableThreshold){
                    conversionTableThreshold[matchThreshold[1]] = conversionTableThreshold[matchThreshold[2]]
                }
            }
        }
    })

    return abilities
}