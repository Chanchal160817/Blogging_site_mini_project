const Blogmodel = require('../Model.js/Blogmodel')
const Authormodel = require('../Model.js/Authormodel')
const mongoose=require('mongoose')

const ObjectId = require('mongoose').Types.ObjectId

const createblog = async (req, res) => {
    try {
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ Error: "Body  should be not emety" })
        }
        let body = req.body
        if (!(body.title && body.body && body.authorId && body.category && body.subcategory && body.tags)) {
            return res.status(400).send({ status: false, msg: " Body must contain title , body ,authorId ,caregory , subcategory and tags !" })
        }
        let id = req.body.authorId
        if (!ObjectId.isValid(body.authorId)) {
            return res.status(404).send({ status: false, msg: "AuthorId invalid" });
          }
        let author = await Authormodel.findById(id)
        if (!author) {
            return res.status(404).send({ status: false, msg: "User not found" })
        }
       
        let data = new Blogmodel(req.body)
        let result = await data.save()
        let ig=result._id.toString()
        if(result.isPublished==true){
            result =await Blogmodel.findOneAndUpdate({_id:ig},{$set:{ispublishedAt:Date.now()}},{new:true})
        }
        res.status(201).send({ status: true, data: result })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }


}

const getblogs = async (req, res) => {
    try {
        let query = req.query 
        
        if (query) {
            let blogs = await Blogmodel.find({ $and: [query, { isDeleted: false }, { isPublished: true }] })
            
             return blogs.length == 0 ?  res.status(404).send({ status: false, msg: "Blog are not found" }) : res.send({ status: true, data: blogs })
        }
        else {
            let blogs = await Blogmodel.find({ isDeleted: false, isPublished: true })
            return blogs.length == 0 ? res.status(404).send({ status: false, msg: "Blog are not found" }) : res.send({ status: true, data: blogs })
        }
        
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }

}

const blogsUpdate = async (req, res) => {
    try {
        let id=req.params.blogid
        let title = req.body.title
        let body = req.body.body
        let tags = req.body.tags
        let category = req.body.category
        let subcategory = req.body.subcategory
        let isPublished=req.body.isPublished
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ Error: "Body  should be not empty" })
        }
        

        let blogid = await Blogmodel.findById(id)
        if (blogid.isDeleted == true) {
            return res.status(404).send({ status: false, msg: " This document already Deleted !!" })
        }
        if(tags){
            var tag = blogid.tags //[]
            tag.push(tags)
        }
        if(subcategory){
            var subcat = blogid.subcategory
            subcat.push(subcategory)
        }
        if(isPublished){
          var date=Date.now()
        }
        
        blog = await Blogmodel.findOneAndUpdate({ _id: id }, { $set: { title: title, body: body, tags: tag, category:category, subcategory: subcat, isPublished: isPublished, ispublishedAt: date } }, { new: true });
        res.status(200).send({ status: true, message:"Success", data:blog })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const deleted = async function (req, res) {
    try {
        //Validate: The blogId is present in request path params or not.
        if (!ObjectId.isValid(req.params.blogid)) {
            return res.status(404).send({ status: false, msg: "BlogId invalid !" });
        }
        let blog_Id = req.params.blogid
        

        //Validate: The blogId is valid or not.
        let blog = await Blogmodel.findById(blog_Id)
        if (!blog) return res.status(404).send({ status: false, msg: "Blog does not exists" })

        //Validate: If the blogId is not deleted (must have isDeleted false)
        let is_Deleted = blog.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, msg: "Blog is already deleted" })

        //Delete a blog by changing the its isDeleted to true.
        let deletedBlog = await Blogmodel.findOneAndUpdate({ _id: blog_Id },
            { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        //Sending the Deleted response after updating isDeleted : true
        return res.status(200).send({ status: true })
    }
    catch (err) {
        
        return res.status(500).send({ status: false, msg: " Server Error", error: err.message })
    }
}

const deleteblog = async function (req, res) {

    try {
       
        let query=req.query
        if (query) {
            let blog = await Blogmodel.findOne(query)
            if (!blog) {
                return res.status(400).send({ status: false, msg: "Blog are not found given query ! " })
            }
            blog = await Blogmodel.findOneAndUpdate(query, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
            return res.send({ status: true, data: blog })
        }
    }
    catch (error) {
        return res.status(500).send({ error: error.message })
    }

}




module.exports.createblog = createblog
module.exports.getblogs = getblogs
module.exports.blogsUpdate = blogsUpdate
module.exports.deleted = deleted
module.exports.deleteblog = deleteblog




