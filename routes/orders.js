const { Router } = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = Router();

router.get('/',async (req, res) => {
    try{
        const orders = await Order.find({'user.userId' : req.user._id})
            .populate('user.userId')
            console.log(orders)

            const orders_tmp = orders.map(o => {
                return {
                    ...o._id,
                    price: o.courses.reduce((total, c) => {
                        return total += c.count * c.course.price
                    }, 0)
                }
            })
            // console.log(`tmp`, orders_tmp)
        res.render('orders', {
            isOrder: true,
            title: 'Orders',
            orders: orders
        })
    }catch(e){
        console.log(e)
    }
    
})

router.post('/', auth, async (req, res) => {
    try{
        const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate()
        console.log(`USER`, user)
    const courses = user.cart.items.map(i => ({
        count: i.count,
        course: {...i.courseId._doc}
    }))
    const order = new Order({
        user: {
            name: req.user.name,
            userId: req.user
        },
        courses
    })

    await order.save()
    console.log(`ORDER`, order)
    req.user.clearCart();  
    res.redirect('/orders')
    }catch(e){
        console.log(e)
    }
})

module.exports = router