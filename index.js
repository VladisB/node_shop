const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs =require('express-handlebars')
const session =require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const csurf = require('csurf')
const flash = require('connect-flash')

const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')

const homeRoutes =require('./routes/home')
const coursesRoutes =require('./routes/courses')
const cartRoutes =require('./routes/cart')
const addRoutes =require('./routes/add')
const aboutRoutes =require('./routes/about')
const orderRoutes =require('./routes/orders')
const authRoutes =require('./routes/auth')
const profileRoutes =require('./routes/profile')

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

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images',express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))

app.use(fileMiddleware.single('avatar'))
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
app.use('/profile', profileRoutes)

app.use(errorHandler)
