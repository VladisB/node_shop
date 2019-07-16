const key = require('../keys/index')

module.exports = function (email, token) {
    return {
        to: email,
        from: key.EMAIL_FROM,
        subject: 'Reset access',
        html: `
            <h1>Forgot password?</h1>
            <p>If not just ignore it</p>
            <p>Else follow the link below:</p>
            <p><a href="${key.BASE_URL}/auth/password/${token}">Reset access</a></p>
            <hr/>
            <a href="${key.BASE_URL}">Course shop</a>
        `
    }
}