var express = require('express');
var router = express.Router();
// const Joi = require('joi');

module.exports = function validate (req, res, next) {

    const data = req.body;

    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(30)
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required(),
        
        phone: Joi.number()
            .min(10)
            .max(15)
            .required(),

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required(),

        repeat_password: Joi.ref('password')
    
    })

    schema.validate(data);

    next()
}