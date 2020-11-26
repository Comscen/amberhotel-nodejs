
function createPhotoRow(){
    var amount = document.querySelectorAll("#photosTable > tr").length
    if(amount >= 8){
        alert('Amount of photos cannot be higher than 8')
        return 
    }
    var photoRow = document.createElement('tr')
    var photoColumn = document.createElement('td')
    var photoColumnName = document.createElement('td')
    var input = document.createElement('input')
    photoColumnName.style = 'width: 250px'
    photoColumnName.innerText = 'Photo URL'
    
    input.name = `photos[${amount}]`
    input.type = 'text'
    input.className = 'form-control'
    input.placeholder = 'Link to a photo'
    input.required = true
    photoColumn.append(input)
    photoRow.append(photoColumnName)
    photoRow.append(photoColumn)
    document.getElementById('photosTable').append(photoRow)
    amount++
}

function removePhotoRow(){
    var amount =  document.querySelectorAll("#photosTable > tr").length
    if(amount == 0){
        alert('Amount of photos cannot be lower than 0')
        return
    }
    var table = document.getElementById('photosTable')
    table.removeChild(table.lastChild) 
}
