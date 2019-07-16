const key = require('../keys/index')

module.exports = function (email) {
    return {
        to: email,
        from: key.EMAIL_FROM,
        subject: 'Registration',
        html: `
            <h1>Welcome!</h1>
            <p>You successuful created account email: ${email}</p>
            <hr/>
            <a href="${key.BASE_URL}">Course shop</a>
        `
    }
}