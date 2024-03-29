function regexWildLocations(textWildLocations, locations){
	const lines = textWildLocations.split("\n")
	const regexMethod = /land_morning_mons|land_night_mons|land_mons|water_mons|rock_smash_mons|fishing_mons|headbutt_morning_mons|headbutt_night_mons|headbutt_mons|hidden_morning_mons|hidden_night_mons|hidden_mons/
	let zone = null, method = null, name = null, index = 0, monsGuard = 0

    lines.forEach(line => {
		if(/MAP_\w+/.test(line)){
			index = 0
			method = null
			name = null
			monsGuard = 0
			zone = sanitizeString(line.match(/MAP_(\w+)/)[1].replace(/([A-Z])(\d)/g, '$1 $2').trim())

			if(!(zone in locations)){
				locations[zone] = {}
			}
		}
		else if(regexMethod.test(line)){
			index = 0
			name = null
			monsGuard = 0
			method = replaceMethodString(line.match(regexMethod)[0], index)

			if(zone && !(method in locations[zone])){
				locations[zone][method] = {}
			}
		}
		else if(/\" *mons *\"/.test(line)){
			monsGuard++
			if(monsGuard > 1){
				method = null
			}
		}
		else if(/SPECIES_\w+/.test(line)){
			name = line.match(/SPECIES_\w+/)[0]

			if(/rod/i.test(method)){
				method = replaceMethodString(method, index)
				if(zone && !(method in locations[zone])){
					locations[zone][method] = {}
				}
			}

			if(zone && method && name in locations[zone][method]){
				locations[zone][method][name] += returnRarity(method, index)
			}
			else if(zone && method){
				locations[zone][method][name] = returnRarity(method, index)
			}
			index++
		}

	})

	delete locations["Meteor Falls Draconid Tribe"]
    return locations
}





function replaceMethodString(method, index){
	if(method.match(/fish|rod/i)){
		if(index >=0 && index <= 1)
			return "Old Rod"
		else if(index >= 2 && index <= 4)
			return "Good Rod"
		else if(index >= 5 && index <= 9)
			return "Super Rod"
	}
	else if(method.match(/headbutt_night/i)){
		return "Headbutt Night"
	}
	else if(method.match(/headbutt_morning/i)){
		return "Headbutt Morning"
	}
	else if(method.match(/headbutt/i)){
		return "Headbutt Day"
	}
	else if(method.match(/hidden_night/i)){
		return "Hidden Night"
	}
	else if(method.match(/hidden_morning/i)){
		return "Hidden Morning"
	}
	else if(method.match(/hidden/i)){
		return "Hidden Day"
	}
	else if(method.match(/water/i)){
		return "Surfing"
	}
	else if(method.match(/rock_smash_night/i)){
		return "Rock Smash Night"
	}
	else if(method.match(/rock_smash_morning/i)){
		return "Rock Smash Morning"
	}
	else if(method.match(/rock_smash/i)){
		return "Rock Smash"
	}
	else if(method.match(/morning/i)){
		return "Morning"
	}
	else if(method.match(/night/i)){
		return "Night"
	}
	else if(method.match(/land/i)){
		return "Day"
	}
    else{
    	console.log(method)
        return method
    }
}


function returnRarity(method, index){
	if(method === "Morning" || method === "Day" || method === "Night" || method === "Surfing"){
		if(index === 0 || index === 1)
			return 20
		else if(index >= 2 && index <= 5){
			return 10
		}
		else if(index >= 6 && index <= 7){
			return 5
		}
		else if(index >= 8 && index <= 9){
			return 4
		}
		else if(index >= 10 || index <= 11){
			return 1
		}
		else
			return 100
	}
	else if(method.match(/headbutt/i)){
		if(index === 0 || index === 1){
			return 20
		}
		else if(index === 2 || index === 3 || index === 4 || index === 5){
			return 10
		}
		else if(index === 6 || index === 7){
			return 5
		}
		else if(index === 8 || index === 9){
			return 4
		}
		else if(index === 10 || index === 11){
			return 1
		}
	}
	else if(method.match(/hidden/i)){
		if(index === 0 || index === 1){
			return 33
		}
		else if(index === 2){
			return 34
		}
	}
	else if(method.match(/Rock Smash/i)){
		if(index === 0)
			return 40
		else if(index === 1)
			return 30
		else if(index === 2)
			return 15
		else if(index === 3)
			return 10
		else if(index === 4)
			return 5
		else
			return 100
	}
	else if(method === "Old Rod"){
		if(index === 0)
			return 70
		else if(index === 1)
			return 30
		else 
			return 100
	}
	else if(method === "Good Rod"){
		if(index === 2)
			return 60
		else if(index === 3 || index === 4)
			return 20
		else 
			return 100
	}
	else if(method === "Super Rod"){
		if(index === 5 || index === 6)
			return 40
		else if(index === 7)
			return 15
		else if(index === 8)
			return 4
		else if(index === 9)
			return 1
		else 
			return 100
	}
    else{
        return 100
    }
}