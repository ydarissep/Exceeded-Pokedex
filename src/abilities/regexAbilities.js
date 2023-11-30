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
    let customAbilitiesStart = null, ID = 0

    lines.forEach(line => {

        if (/ABILITIES_COUNT_CUSTOM/i.test(line) && !customAbilitiesStart){
            customAbilitiesStart = ID
        }

        const matchAbility = line.match(/#define *(ABILITY_\w+)/i)
        if(matchAbility){
            const name = matchAbility[1]


            matchInt = line.match(/\d+/g)
            if(matchInt){
                ID = parseInt(matchInt[matchInt.length-1])
            }
            else{
                ID++
            }

            if(name in abilities){
                if(Number.isInteger(customAbilitiesStart)){
                    abilities[name]["ID"] = ID+customAbilitiesStart
                }
                else{
                    abilities[name]["ID"] = ID
                }
            }
        }
    })
    return abilities
}