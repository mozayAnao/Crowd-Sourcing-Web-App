var express = require('express');
const { any } = require('joi');
var router = express.Router();
const Joi = require('joi');

module.exports = { 
    
    signUp: async (req, res, next) => {

    const data = req.body;
    console.log(req.body)

    const schema = Joi.object().keys({
        name: Joi.string()
            .min(3)
            .max(30)
            .required()
            .error(errors => {
                errors.forEach(err => {
                  switch (err.code) {
                    case "any.empty":
                      err.message = "name should not be empty!";
                      break;
                    case "string.min":
                      err.message = `name should have at least ${err.local.limit} characters!`;
                      break;
                    case "string.max":
                      err.message = `name should have at most ${err.local.limit} characters!`;
                      break;
                    default:
                      break;
                  }
                });
                return errors;
              }),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required(),
        
        phone: Joi.number()
            .required(),
        
        phoneCode: Joi.number()
            .required(),

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required(),

        repeat_password: Joi.valid(Joi.ref('password')).messages({'any.only': 'Password does not match'})
       
           
    })

    // schema.validate(data);
    try {
        const value = await schema.validateAsync(data);
        next()
    }
    catch (err) {
        console.log(err)
        res.redirect(`/?msg=${err.details[0].message}`)
    }  
},

addUser: async (req, res, next) => {

  const data = req.body;
  console.log(req.body)

  const schema = Joi.object().keys({
      name: Joi.string()
          .min(3)
          .max(30)
          .required()
          .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "any.empty":
                    err.message = "name should not be empty!";
                    break;
                  case "string.min":
                    err.message = `name should have at least ${err.local.limit} characters!`;
                    break;
                  case "string.max":
                    err.message = `name should have at most ${err.local.limit} characters!`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),

      email: Joi.string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
          .required(),
      
      phone: Joi.number()
          .required(),
      
      phoneCode: Joi.number()
          .required(), 
      
      role: Joi.string()
            .required(),
  })

  // schema.validate(data);
  try {
      const value = await schema.validateAsync(data);
      next()
  }
  catch (err) {
      console.log(err)
      res.redirect(`/admin/addUser?msg=${err.details[0].message}`)
  }  
},

editUser: async (req, res, next) => {

  const data = req.body;
  console.log(req.body)

  const schema = Joi.object().keys({
      name: Joi.string()
          .min(3)
          .max(30)
          .required()
          .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "any.empty":
                    err.message = "name should not be empty!";
                    break;
                  case "string.min":
                    err.message = `name should have at least ${err.local.limit} characters!`;
                    break;
                  case "string.max":
                    err.message = `name should have at most ${err.local.limit} characters!`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),

      email: Joi.string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
          .required(),
      
      phone: Joi.number()
          .required(),
      
      phoneCode: Joi.number()
          .required(), 
      
          role: Joi.string()
          .required(),
  })

  // schema.validate(data);
  try {
      const value = await schema.validateAsync(data);
      next()
  }
  catch (err) {
      console.log(err)
      res.redirect(`/admin/editUser?msg=${err.details[0].message}`)
  }  
}

}