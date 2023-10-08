window.repo = "benicioneto/Exceeded-Pokedex/main"
window.repoTypeChartUrl = "https://raw.githubusercontent.com/ydarissep/Exceeded-Pokedex/main/src/typeChart.json"
window.checkUpdate = "11 EE"
window.innatesDefined = true


fetch('https://raw.githubusercontent.com/ydarissep/dex-core/main/index.html').then(async response => {
	return response.text()
}).then(async rawHTMLText => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(rawHTMLText, 'text/html')
    document.querySelector('html').innerHTML = doc.querySelector('html').innerHTML




    document.title = "EE Dex"
    document.getElementById("footerName").innerText = "Exceeded\nYdarissep Pokedex"


    const headerAbilitiesID = document.createElement("th"); headerAbilitiesID.innerText = "ID"; headerAbilitiesID.className = "abilityID"
    document.querySelector("#abilitiesTableThead > tr").insertBefore(headerAbilitiesID, document.querySelector("#abilitiesTableThead > tr").firstChild)

    const headerMovesID = document.createElement("th"); headerMovesID.innerText = "ID"; headerMovesID.className = "moveID"
    document.querySelector("#movesTableThead > tr").insertBefore(headerMovesID, document.querySelector("#movesTableThead > tr").firstChild)


    await fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/global.js").then(async response => {
        return response.text()
    }).then(async text => {
        await eval.call(window,text)

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
    }).catch(error => {
        console.warn(error)
    })    

}).catch(error => {
	console.warn(error)
})


