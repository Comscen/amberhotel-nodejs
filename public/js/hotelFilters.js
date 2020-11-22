function filterHotels() {
    let hotels = document.getElementsByName('hotel')
    let city = document.getElementById('city').value
    let country = document.getElementById('country').value
    
    resetHotels()
    if (city !== '') {
        for (hotel of hotels) {
            if (hotel.id.split(':')[0] !== city)
                hotel.style = 'display: none;'
        }
    }

    if (country !== '') {
        for (hotel of hotels) {
            if (hotel.id.split(':')[1] !== country)
                hotel.style = 'display: none;'
        }
    }

}

function resetHotels() {
    for (hotel of document.getElementsByName('hotel')) {
        hotel.style = 'margin-bottom: 10px; border: 1px solid #dee2e6; border-radius: 10px; padding: 5px'
    }
}

function updateRangeValue(input) {
    document.getElementsByTagName('output')[0].innerText = `Minimum rating: ${input.value}`
}