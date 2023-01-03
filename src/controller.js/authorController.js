const authorModel = require('../Model.js/Authormodel')
const jwt = require("jsonwebtoken")
const validator = require('validator'); 
const { fn } = require('moment/moment');

function isEmail(emailAdress) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // w use for char * use for breakpoint $ for end
    if (regex.test(emailAdress))
        return true;
    else
        return false;
}
function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0; 
  }
  



const createAuthor = async (req, res) => {
    try {
        let body = req.body
        if (Object.keys(body).length == 0) {
            return res.status(400).send({ Error: "Body should be not empty" })
        }
       const {fname,lname,title,email,password} = body

        if(!(fname && lname && title && email && password)){
            return res.status(400).send({status:false,message:"fname ,lname ,title ,email and password required fields"})
        }
        if(hasWhiteSpace(fname) || hasWhiteSpace(lname) || hasWhiteSpace(email) ||hasWhiteSpace(password) ||hasWhiteSpace(title)){
            return res.status(400).send({status:false,message:"Whitepase are not allowed in fname, lname ,title, email and password"})
        }
        if(!['Mr','Miss','Mrs'].includes(title)){
            return res.status(400).send({status:false, msg:"Title must Mr , Miss and Mrs !"})
        }
        let emailvalid = isEmail(body.email)
        if (emailvalid == false) {
            return res.status(400).send({ status: false, msg: "Invalid email ! please enter valid email address ! " })
        }
        if (!validator.isStrongPassword(body.password)) {
            return res.status(400).send({ status: false, msg: "Password must be contain 1 uppercase 1 lowercase special char and min 8 length" })
        }
        let checkemail=await authorModel.findOne({email:body.email})
        if(checkemail){
            return res.status(400).send({status:false,msg:"Email already exit"})
        }
        let data = new authorModel(req.body)
        let result = await data.save()
        res.status(201).send({ status: true, data: result })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }


}
const login = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Email and Password Required !" })
        if (!email) return res.status(400).send({ status: false, msg: "email is required" })
        if (!password) return res.status(400).send({ status: false, msg: "password is required" })
        const user = await authorModel.findOne({ email: email, password: password })
        if (!user) return res.status(401).send({ status: false, msg: "Email or Password Invalid Please try again !!" })
        const token = jwt.sign({
            userId: user._id.toString(),
            batch: "plutonium",

        }, "this is a secreat key")
        res.setHeader("x-api-key", token)

        res.status(200).send({ status: true, data:{token:token} })





    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.createAuthor = createAuthor
module.exports.login = login