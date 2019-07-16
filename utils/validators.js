const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Please, enter the correct email')
        .custom( async (value, {req}) => {
        try{
            const candidate = await User.findOne({email: value})
            if (candidate){
                return Promise.reject('Such email already exist!')
            }
        }catch(e){
            console.log(e)
        }
        })
        .normalizeEmail(),
    body('password', 'Password have to cosist min form 6 symbs')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('Passwords have to match')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({min: 3})
        .withMessage('Name have to cosist min form 3 symbs')
        .trim()
]

exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Min length 3 symbs').trim(),
    body('price').isNumeric().withMessage('Enter the correct price!'),
    body('img', 'Enter the correct URL address!').isURL()
]