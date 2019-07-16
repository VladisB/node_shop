const { Router } = require('express')
const Courses = require('../models/course')
const auth = require('../middleware/auth')
const router = Router();

function isOwner (course, req){
    console.log('isowner')
    return course.userId.toString() === req.user._id.toString()
}

router.get('/',async (req, res) => {
    try{
        const courses = await Courses.find()
        .populate('userId', 'email name')
        .select('price title img')
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        userId: req.user ? req.user._id.toString() : null,
        courses
    })
    }catch(e){
        console.log(e)
    }
})

router.get('/:id',async (req, res) => {
    const course = await Courses.findById(req.params.id)
    res.render('course',{
        layout: 'empty',
        title : `Course ${course.title}`,
        course})
})

router.get('/:id/edit', auth, async (req, res) => {
    if(!req.query.allow){
        return res.redirect('/')
    }

    try{
        const course = await Courses.findById(req.params.id)
        if(!isOwner(course, req)){
            console.log('isowner false')
            return res.redirect('/courses')
        }
        console.log('isowner true')
        res.render('course-edit', {
            title : `Edit course ${course.title}`,
            course})
    }catch(e){
        console.log(e)
    }
})

router.post('/edit', auth, async (req, res) => {
    const {id} = req.body
    delete req.body.id
    const course = await Courses.findById(id)
    if(!isOwner(course, req)){
        res.redirect('/courses')
    }
    Object.assign(course, req.body)
    await course.save()
    // await Courses.findByIdAndUpdate(id, req.body)
    res.redirect('/courses')
})

router.post('/remove', auth, async (req, res) => {
    try{
        await Courses.deleteOne({
            _id: req.body.id,
        userId : req.user._id
        })
        res.redirect('/courses')
    }catch(e){
        console.log(e)
    }
})


module.exports = router