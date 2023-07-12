const express = require('express');
const router = express.Router();
const path = require('path');
//jwt
const jwt = require('jsonwebtoken');

//JSONWEBTOKEN

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Al ingresar un nombre y un email te devuelve un token que expira en 120 segundos
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 */



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