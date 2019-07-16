const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs =require('express-handlebars')
const session =require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const csurf = require('csurf')
const flash = require('connect-flash')

// const User = require('./models/user')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')

const homeRoutes =require('./routes/home')
const coursesRoutes =require('./routes/courses')
const cartRoutes =require('./routes/cart')
const addRoutes =require('./routes/add')
const aboutRoutes =require('./routes/about')
const orderRoutes =require('./routes/orders')
const authRoutes =require('./routes/auth')

const keys = require('./keys/index')

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
})
const store = new MongoStore({
    collection: 'session',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

// app.use(async (req, res, next) => {
//     try{
//         const user = await User.findById('5d2732e39fb53f01a571274c')
//         req.user = user
//         next()
//     }catch(e){
//         console.log(e)
//     }
// })

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(csurf())
app.use(varMiddleware)
app.use(flash())
app.use(userMiddleware)

const port = process.env.PORT || 3000

async function start(){
    try{
         await mongoose.connect(keys.MONGODB_URI, {
             useNewUrlParser: true,
             useFindAndModify: false
            })
        // const candidate = await User.findOne()
        // if(!candidate){
        //     const user = new User({
        //         email: 'vladyslav@gmail.com',
        //         name: 'Vlad',
        //         password: '123456789',
        //         cart: {items: []}
        //     })
        //     await user.save()
        // }
         app.listen(port, ()=> {
             console.log(`Server has been started port ${port}`)
         })
    }catch(e){
        console.log(e)
    }  
}

start()

app.use('/', homeRoutes)
app.use('/about', aboutRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)
app.use('/auth', authRoutes)
