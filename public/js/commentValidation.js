const regexes = {
    title: /^[^\\W]{0}[0-9]{0,}[\p{L}\d\s\-.&,!()'"#%]{1,}$/u,
    content: /^[^\\W]{0}[0-9]{0,}[\p{L}\d\s\-&.,!?'"#%()]{0,}$/u,
    rating: /^[0-9]{0,}$/,
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