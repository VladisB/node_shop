const { Router } = require('express')
const Courses = require('../models/course')
const auth = require('../middleware/auth')
const router = Router();
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')

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
            return res.redirect('/courses')
        }
        res.render('course-edit', {
            title : `Edit course ${course.title}`,
            course})
    }catch(e){
        console.log(e)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).redirect(`/coursers/${id}/edit?allow=true`)
    }

    const {id} = req.body
    delete req.body.id
    const course = await Courses.findById(id)
    if(!isOwner(course, req)){
        res.redirect('/courses')
    }
    Object.assign(course, req.body)
    await course.save()
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