const express = require('express');
const router = express.Router();
//jwt
const jwt = require('jsonwebtoken');

//JSONWEBTOKEN
router.post("/api/login", (req, res) => {
    const user = {
      nombre: req.body.nombre,
      email: req.body.email
    }

    const secretKey = process.env.SECRET_KEY;
  
    jwt.sign({ user }, secretKey, { expiresIn: '120s' }, (err, token) => {
      res.json({
        token
      })
    });
  })

  module.exports = router;