const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const regEx = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (email.match(regEx)) return true;
    else return false;
}

exports.validateSignUpData = (newUser) => {
    let errors = {};
    if (isEmpty(newUser.email)) {
        errors.email = 'Email must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address'
    }
    
    if (isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = ' Password must match';
    if (isEmpty(newUser.handle)) errors.handle = ' Password must match';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors)
    }

    return { 
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (user) => {
    let errors = {};
    if (isEmpty(user.email)) errors.email = 'Must not be empty';
    if (isEmpty(user.password)) errors.password = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    return { 
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

// Removes empty data fields for user details
exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())){
        if(data.website.trim().substring(0,4) !== 'http') {
            userDetails.website = `https://${data.website.trim()}`
        } else {
            userDetails.website = data.website;
        }
    } 
    if (!isEmpty(data.location.trim())) userDetails.location = data.location;
    return userDetails
}