function filterHotels() {
    let hotels = document.getElementsByName('hotel')
    let city = document.getElementById('city').value
    let country = document.getElementById('country').value
    let rating = document.getElementById('rating').value
    
    resetHotels()
    for(let hotel of hotels) {
        if (city !== '') {
            if (hotel.id.split(':')[0] !== city)
                hotel.style = 'display: none;'
        }

        if (country !== '') {
            if (hotel.id.split(':')[1] !== country)
                hotel.style = 'display: none;'
        }

        console.log(parseFloat(hotel.querySelector("span[name='rating']").innerText));
        console.log(document.getElementById('rating').value);
        if (parseFloat(hotel.querySelector("span[name='rating']").innerText) < parseFloat(document.getElementById('rating').value)) {
            hotel.style = 'display: none;'
        }

    }
}

function resetHotels() {
    for (hotel of document.getElementsByName('hotel')) {
        hotel.style = 'margin-bottom: 10px; border: 1px solid #dee2e6; border-radius: 10px; padding: 5px'
    }
}

function resetFilters() {
    resetHotels();
    let rating = document.getElementById('rating')
    rating.value = 3.0
    updateRangeValue(rating)
    document.getElementById('city').value = ''
    document.getElementById('country').value = 'Poland'
}

function updateRangeValue(input) {
    document.getElementsByTagName('output')[0].innerText = `Minimum rating: ${input.value}`
}