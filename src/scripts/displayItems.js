fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/scripts/displayItems.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("itemSpriteContainer.append(itemSprite)", `${displayItemID()}\nitemSpriteContainer.append(itemSprite)\n${displayItemSlot()}`)
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})


function displayItemID(){
    return 'const itemID = document.createElement("div"); itemID.innerText = items[key]["ID"]\nif(items[key]["ID"] !== 0){itemSpriteContainer.append(itemID)}'
}

function displayItemSlot(){
    return 'const itemSlot = document.createElement("div"); itemSlot.innerText = `Slot ${items[key]["slot"].toString()}`\nif(itemSlot.innerText !== "Slot "){itemSpriteContainer.append(itemSlot)}'
}