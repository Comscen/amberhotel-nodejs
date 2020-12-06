function filterRooms() {
    resetRooms()
    var rooms = document.getElementsByName('room');
    for (let room of rooms) {

        var roomInfo = {
            roomName: room.querySelector("h2[name='roomName']").innerText.toLowerCase(),
            hotelName: room.querySelector("a[name='hotelName']").innerText.toLowerCase(),
            city: room.querySelector("input[name='city']").value.toLowerCase(),
            country: room.querySelector("input[name='country']").value,
            price: room.querySelector(".product-price").innerText.slice(1),
            beds: room.querySelector("td[name='beds']").innerText,
            capacity: room.querySelector("td[name='capacity']").innerText.split(' ')[0],
            standard: room.querySelector("td[name='standard']").innerText,
            rating: room.querySelector("span[name='rating']").innerText.trim()
        }

        var nameFilters = {
            roomName: document.getElementById('roomName').value.toLowerCase(),
            hotelName: document.getElementById('hotelName').value.toLowerCase(),
        }

        var basicFilters = {
            city: document.getElementById('city').value.toLowerCase(),
            country: document.getElementById('country').value,
            beds: document.getElementById('beds').value,
            capacity: document.getElementById('capacity').value,
            standard: document.getElementById('standard').value,
        }

        for (const [key, value] of Object.entries(nameFilters)) {
            if (value !== '') {
                if (!roomInfo[key].includes(value)) {
                    hideRoom(room);
                }
            }
        }

        for (const [key, value] of Object.entries(basicFilters)) {
            if (value !== '') {
                if (roomInfo[key] != value) {
                    hideRoom(room);
                }
            }
        }

        let priceMin = document.getElementById('priceLow').value;
        let priceMax = document.getElementById('priceHigh').value;

        if (priceMin !== '') {
            if (parseInt(roomInfo["price"]) < parseInt(priceMin))
                hideRoom(room);
        }

        if (priceMax !== '') {
            if (parseInt(roomInfo["price"]) > parseInt(priceMax))
                hideRoom(room);
        }

        if (parseFloat(roomInfo["rating"]) < parseFloat(document.getElementById('rating').value))
            hideRoom(room);

        if(roomInfo["rating"] === 'No rating' && document.getElementById('hideNoRating').checked) {
            hideRoom(room);
        }

    }
}

function hideRoom(room) {
    room.style = 'display: none;'
}

function resetRooms() {
    for (let room of document.getElementsByName('room')) {
        room.style = 'width: 1000px;'
    }
}

function resetFilters() {
    resetRooms();
    let rating = document.getElementById('rating')
    rating.value = 2.5
    updateRangeValue(rating)
    document.getElementById('hotelName').value = '';
    document.getElementById('city').value = '';
    document.getElementById('country').value = 'Poland';
    document.getElementById('roomName').value = '';
    document.getElementById('beds').value = '';
    document.getElementById('capacity').value = '';
    document.getElementById('standard').value = 'Standard';
    document.getElementById('priceLow').value = '';
    document.getElementById('priceHigh').value = '';
    document.getElementById('hideNoRating').checked = false;
}

function updateRangeValue(input) {
    document.getElementsByTagName('output')[0].innerText = `Minimum rating: ${input.value}`
}