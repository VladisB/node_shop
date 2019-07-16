const { Router } = require('express')
const crypto = require('crypto')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
// const {validationResult, body} = require('express-validator/check')
const {validationResult } = require('express-validator');
// const {validationResult} = require('express-validator')
// const {registerValidators} = require('../utils/validators')

const {registerValidators} = require('../utils/validators')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const router = Router();
const key = require('../keys/index')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: key.SENDGRID_API_KEY}
}))
router.get('/login',async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})
router.post('/login',async (req, res) => {
    try{
        const { email, password} = req.body
        const candidate = await User.findOne({email})
        if(candidate){
            const areSame = await bcrypt.compare(password, candidate.password)
            if(areSame){
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err =>{
                if(err){
                    throw err
                }else{
                    res.redirect('/')
                }
            })
            }else{
                req.flash('loginError', 'Wrong password!')
                res.redirect('/auth/login#login') 
            }
        }else{
            req.flash('loginError', `User with this email doesn't exist!`)
            res.redirect('/auth/login#login')
        }
    }catch{

    }
})
router.get('/logout',async (req, res) => {
    console.log('logout')
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})
router.get('/reset', (req, res) => {
    console.log('reset')
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error')
    }) 
})

router.post('/password', async (req, res) => {
    try{
        const user = await User.findOne({
            _id: req.body.userId,
            resToken : req.body.token,
            resTokenExp : {$gt: Date.now()}
        })
        console.log(user)
        if(user){
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resToken = undefined
            user.resTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        }else{
            req.flash('loginError', 'Token live was ended')
            res.redirect('/auth/login')
        }
    }catch(e){
        console.log(e)
    }
})

router.post('/reset', (req, res) => {
    console.log('reset 1')
    try{
        crypto.randomBytes(32, async (err, buffer) => {
            if(err){
                req.flash('error', 'Something was wrong, please repeat leter..')
                res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})
            if(candidate){
                candidate.resToken = token
                candidate.resTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            }else{
                req.flash('error', 'This email does not exist!')
                res.redirect('/auth/reset')
            }   
            })
    }catch(e){
        console.log(a)
    }
})

router.get('/password/:token', async (req, res) => {
    console.log('password')
    if(!req.params.token){
        return res.redirect('/auth/login')
    }

    try{
        // const user = await User.findOne({
        //     resetToken : req.params.token,
        //     resetTokenExp : {$gt: Date.now()}
        // })
        const user = await User.findOne({
            resToken: req.params.token,
            resTokenExp: {$gt: Date.now()}
        })
        if(!user){
            console.log('user not found')
            return res.redirect('/auth/login')
        }else{
            console.log('user found')
            res.render('auth/password', {
                title: 'New password',
                error: req.flash('error'),
                userId : user._id.toString(),
                token: req.params.token
            }) 
        }
        
    }catch(e){
        console.log(e)
    }

    
})


router.post('/register', registerValidators , async (req, res) => {
    try{
        const {email, name, password, confirm} = req.body
        
        const candidate = await User.findOne({email})
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log('ERR')
          req.flash('registerError', errors.array()[0].msg)
          return res.status(422).redirect('/auth/login#register')
        }

        if(candidate){
            req.flash('registerError', 'User with this email exist!')
            res.redirect('/auth/login#register')
        }else{
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({email, name, password: hashPassword, cart: {items: []}})
            await user.save()
            res.redirect('/auth/login#login')
            await transporter.sendMail(regEmail(email))
        }
    }catch(e){
        console.log(e)
    }
})


module.exports = router