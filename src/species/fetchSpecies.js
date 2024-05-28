async function getSpecies(species){
    footerP("Fetching species")
    const rawSpecies = await fetch(`https://raw.githubusercontent.com/${repo}/species.h`)
    const textSpecies = await rawSpecies.text()

    return regexSpecies(textSpecies, species)
}


async function getBaseStats(species){
    const rawBaseStats = await fetch(`https://raw.githubusercontent.com/${repo}/base_stats.h`)
    const textBaseStats = await rawBaseStats.text()
    return regexBaseStats(textBaseStats, species)
}

async function getLevelUpAbilitiesLearnsets(species){
    const rawlevelUpAbilitiesLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/level_up_ability_learnsets.h`)
    const textlevelUpAbilitiesLearnsets = await rawlevelUpAbilitiesLearnsets.text()

    const rawlevelUpAbilitiesLearnsetsPointers = await fetch(`https://raw.githubusercontent.com/${repo}/level_up_ability_pointers.h`)
    const textlevelUpAbilitiesLearnsetsPointers = await rawlevelUpAbilitiesLearnsetsPointers.text()


    const levelUpAbilitiesLearnsetsConversionTable = getlevelUpAbilitiesLearnsetsConversionTable(textlevelUpAbilitiesLearnsetsPointers)


    return regexlevelUpAbilitiesLearnsets(textlevelUpAbilitiesLearnsets, levelUpAbilitiesLearnsetsConversionTable, species)
}

async function getTutorAbilities(species){
    const rawTutorAbilities = await fetch(`https://raw.githubusercontent.com/${repo}/tutor_abilities.h`)
    const textTutorAbilities = await rawTutorAbilities.text()

    return regexTutorAbilities(textTutorAbilities, species)
}

async function getLevelUpLearnsets(species){
    const rawLevelUpLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/level_up_learnsets.h`)
    const textLevelUpLearnsets = await rawLevelUpLearnsets.text()

    const rawLevelUpLearnsetsPointers = await fetch(`https://raw.githubusercontent.com/${repo}/level_up_learnset_pointers.h`)
    const textLevelUpLearnsetsPointers = await rawLevelUpLearnsetsPointers.text()


    const levelUpLearnsetsConversionTable = getLevelUpLearnsetsConversionTable(textLevelUpLearnsetsPointers)


    return regexLevelUpLearnsets(textLevelUpLearnsets, levelUpLearnsetsConversionTable, species)
}

async function getTMHMLearnsets(species){
    const rawTMHMLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/tmhm_learnsets.h`)
    const textTMHMLearnsets = await rawTMHMLearnsets.text()

    const TMHMLearnsetsConversionTable = getTMHMLearnsetsConversionTable(textTMHMLearnsets)

    return regexTMHMLearnsets(textTMHMLearnsets, TMHMLearnsetsConversionTable, species)
}

async function getEvolution(species){
    const rawEvolution = await fetch(`https://raw.githubusercontent.com/${repo}/evolution.h`)
    const textEvolution = await rawEvolution.text()

    return regexEvolution(textEvolution, species)
}

async function getForms(species){
    const rawForms = await fetch(`https://raw.githubusercontent.com/${repo}/form_species_tables.h`)
    const textForms = await rawForms.text()

    return regexForms(textForms, species)
}

async function getEggMovesLearnsets(species){
    const rawEggMoves = await fetch(`https://raw.githubusercontent.com/${repo}/egg_moves.h`)
    const textEggMoves = await rawEggMoves.text()

    return regexEggMovesLearnsets(textEggMoves, species)
}

async function getTutorLearnsets(species){
    const rawTutorLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/tutor_learnsets.h`)
    const textTutorLearnsets = await rawTutorLearnsets.text()

    const tutorLearnsetsConversionTable = getTutorLearnsetsConversionTable(textTutorLearnsets)

    return regexTutorLearnsets(textTutorLearnsets, tutorLearnsetsConversionTable, species)
}

async function getSprite(species){
    footerP("Fetching sprites")
    const rawFrontPicTable = await fetch(`https://raw.githubusercontent.com/${repo}/front_pic_table.h`)
    const textFrontPicTable = await rawFrontPicTable.text()

    const rawSprite = await fetch(`https://raw.githubusercontent.com/${repo}/pokemon.h`)
    const textSprite = await rawSprite.text()

    const spriteConversionTable = getSpriteConversionTable(textFrontPicTable, species)

    return regexSprite(textSprite, spriteConversionTable, species)
}

async function getChanges(species, url){
    footerP("Fetching species changes")
    const rawChanges = await fetch(url)
    const textChanges = await rawChanges.text()
    return regexChanges(textChanges, species)
}






async function buildSpeciesObj(){
    let species = {}
    species = await getSpecies(species)
    
    species = await initializeSpeciesObj(species)
    species = await getEvolution(species)
    species = await getForms(species) // should be called in that order until here
    species = await getBaseStats(species)
    species = await getChanges(species, "https://raw.githubusercontent.com/rh-hideout/pokeemerald-expansion/e22ac5161723e7baf711ac66fab28c8feff2cd85/src/data/pokemon/species_info.h")
    species = await getLevelUpAbilitiesLearnsets(species)
    species = await getTutorAbilities(species)
    species = await getLevelUpLearnsets(species)
    species = await getTMHMLearnsets(species)
    species = await getEggMovesLearnsets(species)
    species = await getTutorLearnsets(species)
    species = await getSprite(species)

    Object.keys(species).forEach(name => {
        if(species[name]["type1"] === "TYPE_FIRE" || species[name]["type2"] === "TYPE_FIRE"){
            if(!species[name]["tutorLearnsets"].includes("MOVE_BURN_UP"))
                species[name]["tutorLearnsets"].push("MOVE_BURN_UP")
        }
        if(species[name]["type1"] === "TYPE_DRAGON" || species[name]["type2"] === "TYPE_DRAGON"){
            if(!species[name]["tutorLearnsets"].includes("MOVE_DRACO_METEOR"))
                species[name]["tutorLearnsets"].push("MOVE_DRACO_METEOR")
        }
    })
    await localStorage.setItem("species", LZString.compressToUTF16(JSON.stringify(species)))
    return species
}


function initializeSpeciesObj(species){
    footerP("Initializing species")
    for (const name of Object.keys(species)){
        species[name]["baseHP"] = 0
        species[name]["baseAttack"] = 0
        species[name]["baseDefense"] = 0
        species[name]["baseSpAttack"] = 0
        species[name]["baseSpDefense"] = 0
        species[name]["baseSpeed"] = 0
        species[name]["BST"] = 0
        species[name]["abilities"] = ["ABILITY_NONE", "ABILITY_NONE", "ABILITY_NONE"]
        //species[name]["innates"] = []
        species[name]["type1"] = ""
        species[name]["type2"] = ""
        species[name]["item1"] = ""
        species[name]["item2"] = ""
        species[name]["eggGroup1"] = ""
        species[name]["eggGroup2"] = ""
        species[name]["changes"] = []
        species[name]["levelUpAbilities"] = []
        species[name]["tutorAbilities"] = []
        species[name]["levelUpLearnsets"] = []
        species[name]["TMHMLearnsets"] = []
        species[name]["eggMovesLearnsets"] = []
        species[name]["tutorLearnsets"] = []
        species[name]["evolution"] = []
        species[name]["evolutionLine"] = [name]
        species[name]["forms"] = []
        species[name]["sprite"] = ""
    }
    return species
}


async function fetchSpeciesObj(){
    if(!localStorage.getItem("species"))
        window.species = await buildSpeciesObj()
    else
        window.species = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("species")))


    window.sprites = {}
    window.speciesTracker = []

    for(let i = 0, j = Object.keys(species).length; i < j; i++){
        speciesTracker[i] = {}
        speciesTracker[i]["key"] = Object.keys(species)[i]
        speciesTracker[i]["filter"] = []
    }

    tracker = speciesTracker
}

