const regexes = {
    name: /^[^\\W]{0}[\p{L}\s0-9.,-]{5,64}$/u,
    description: /^[^\\W]{0}[\p{L}0-9\d\s.&,!?'"-]{0,900}$/u,
    price: /^[0-9/p.]{0,}$/,
    beds: /^[0-9]{0,}$/,
    capacity: /^[0-9]{0,}$/,

};


function changeBorder(element, color) {
    element.style.border = `1px solid ${color}`
}

function isFieldValid(field) {
    if (!regexes[field.name].test(field.value)) {
        changeBorder(field, 'red')
        document.getElementById(`${field.name}Error`).style.removeProperty('display')
        return false
    }
    changeBorder(field, 'green')
    document.getElementById(`${field.name}Error`).style = 'display: none'
    return true
}

function validateForm(form) {
    for (let input of document.getElementsByClassName('form-control')) {
        if (!isFieldValid(input))
            return false
    }
    return true
}
