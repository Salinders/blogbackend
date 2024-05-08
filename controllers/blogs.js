const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/users')




blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { name: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }

})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ? body.likes : 0,
        user: user._id
    })

    if (body.title === undefined || body.author === undefined) {
        response.status(400).json({ error: 'title or author missing' })
    } else {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.status(201).json(savedBlog)

    }


})

blogsRouter.delete('/:id', async (request, response) => {
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log(user)

    const blog = await Blog.findById(request.params.id)
    console.log(blog.user.toString())
    console.log(user.id)

    if (blog.user.toString() !== user.id) {
        return response.status(401).json({ error: 'sorry no beuno' })
    }
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()

})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ? body.likes : 0,

    }
    await Blog.findByIdAndUpdate(request.params.id, blog), { new: true }
    response.json(blog)

})


module.exports = blogsRouter