window.repo = "benicioneto/Exceeded-Pokedex/main"
window.repoTypeChartUrl = "https://raw.githubusercontent.com/ydarissep/Exceeded-Pokedex/main/src/typeChart.json"
window.checkUpdate = "21 EE"
//window.innatesDefined = true


fetch('https://raw.githubusercontent.com/ydarissep/dex-core/main/index.html').then(async response => {
	return response.text()
}).then(async rawHTMLText => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(rawHTMLText, 'text/html')
    document.querySelector('html').innerHTML = doc.querySelector('html').innerHTML




    document.title = "EE Dex"
    document.getElementById("footerName").innerText = "Exceeded\nYdarissep Pokedex"


    await fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/global.js").then(async response => {
        return response.text()
    }).then(async text => {
        await eval.call(window,text)

        const headerAbilitiesID = document.createElement("th"); headerAbilitiesID.innerText = "ID"; headerAbilitiesID.className = "abilityID"
        document.querySelector("#abilitiesTableThead > tr").insertBefore(headerAbilitiesID, document.querySelector("#abilitiesTableThead > tr").firstChild)

        const headerMovesID = document.createElement("th"); headerMovesID.innerText = "ID"; headerMovesID.className = "moveID"
        document.querySelector("#movesTableThead > tr").insertBefore(headerMovesID, document.querySelector("#movesTableThead > tr").firstChild)

        headerAbilitiesID.addEventListener("click", () => {
            if(headerAbilitiesID.classList.contains("th-sort-desc"))
                sortTableByClassName(abilitiesTable, abilities, ["ID"], "abilityID", asc = true)
            else
                sortTableByClassName(abilitiesTable, abilities, ["ID"], "abilityID", asc = false)
        })

        headerMovesID.addEventListener("click", () => {
            if(headerMovesID.classList.contains("th-sort-desc"))
                sortTableByClassName(movesTable, moves, ["ID"], "moveID", asc = true)
            else
                sortTableByClassName(movesTable, moves, ["ID"], "moveID", asc = false)
        })


        const speciesPanelAbilityTablesContainer = document.createElement("div"); speciesPanelAbilityTablesContainer.setAttribute("id", "speciesPanelAbilityTablesContainer")
        
        const speciesPanellevelUpAbilitiesTable = document.createElement("table"); speciesPanellevelUpAbilitiesTable.setAttribute("id", "speciesPanellevelUpAbilitiesTable"); speciesPanellevelUpAbilitiesTable.className = "speciesPanelLearnsetsTableMargin"
        speciesPanellevelUpAbilitiesTable.innerHTML = `<caption class="bold">Level-Up Abilities</caption>
        <thead id="speciesPanellevelUpAbilitiesTableTHead">
            <tr>
                <th>Lvl</th>
                <th>Name</th>
                <th>Innate</th>
                <th>Temp</th>
                <th colspan="4">Incompatibility</th>
            </tr>
        </thead>
        <tbody id="speciesPanellevelUpAbilitiesTableTbody"></tbody>`
        speciesPanelAbilityTablesContainer.append(speciesPanellevelUpAbilitiesTable)

        const speciesPanelTutorAbilityTable = document.createElement("table"); speciesPanelTutorAbilityTable.setAttribute("id", "speciesPanelTutorAbilityTable"); speciesPanelTutorAbilityTable.className = "speciesPanelLearnsetsTableMargin"
        speciesPanelTutorAbilityTable.innerHTML = `<caption class="bold">Tutor Abilities</caption>
        <thead id="speciesPanelTutorAbilityTableTHead">
            <tr>
                <th colspan="8">Name</th>
            </tr>
        </thead>
        <tbody id="speciesPanelTutorAbilityTableTbody"></tbody>`
        speciesPanelAbilityTablesContainer.append(speciesPanelTutorAbilityTable)

        speciesPanelContainer.insertBefore(speciesPanelAbilityTablesContainer, speciesDefensiveTypeChartContainer)

        window.speciesPanellevelUpAbilitiesTableTbody = document.getElementById("speciesPanellevelUpAbilitiesTableTbody")
        
    }).catch(error => {
        console.warn(error)
    })    

}).catch(error => {
	console.warn(error)
})


