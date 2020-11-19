const regexes = {
    name: /^[^0-9]{0}[^\\W]{0}[\p{L}]{1,50}$/u,
    surname: /^[^0-9]{0}[^\\W]{0}[\p{L}]{1,50}$/u,
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?]{5,30}/,
};

function changeBorder(element, color) {
    element.style.border = `1px solid ${color}`
}


function doPasswordsMatch(field) {
    if (field.value == document.getElementsByName('password')[0].value) {
        changeBorder(field, 'green')
        document.getElementById(`${field.name}Error`).style = 'display: none'
        return true
    }
    changeBorder(field, 'red')
    document.getElementById(`${field.name}Error`).style.removeProperty('display')
    return false
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
