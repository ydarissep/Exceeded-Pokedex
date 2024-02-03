async function getWildLocations(locations){
    footerP("Fetching wild locations")
    const rawWildLocations = await fetch(`https://raw.githubusercontent.com/${repo}/wild_encounters.json`)
    const textWildLocations = await rawWildLocations.text()

    return regexWildLocations(textWildLocations, locations)   
}

async function buildLocationsObj(){
    let locations = {}

    locations = await getWildLocations(locations)

    await localStorage.setItem("locations", LZString.compressToUTF16(JSON.stringify(locations)))
    return locations
}


async function fetchLocationsObj(){
    if(!localStorage.getItem("locations")){
        window.locations = await buildLocationsObj()
    }
    else{
        window.locations = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("locations")))   
    }

    let counter = 0
    window.locationsTracker = []
    Object.keys(locations).forEach(zone => {
        Object.keys(locations[zone]).forEach(method => {
            Object.keys(locations[zone][method]).forEach(speciesName => {
                locationsTracker[counter] = {}
                locationsTracker[counter]["key"] = `${zone}\\${method}\\${speciesName}`
                locationsTracker[counter]["filter"] = []
                counter++
            })
        })
    })
}