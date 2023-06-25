var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require('jsonwebtoken');
const verificacion = require("../verificacionToken");

/**
 * @swagger
 * /fac:
 *   get:
 *     summary: Obtiene las facultades almacenadas en la base de datos
 *     parameters:
 *       - name: desde
 *         in: query
 *         description: Número de página
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: hasta
 *         in: query
 *         description: Tamaño de página
 *         schema:
 *           type: integer
 *           default: 5
 *     tags:
 *       - Facultades
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la facultad
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la facultad
 *                   director:
 *                     type: string
 *                     description: Director de la facultad
 *                   Carrera-Relacionada:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID de la carrera asociada
 *                         nombre:
 *                           type: string
 *                           description: Nombre de la carrera asociada
 *       500:
 *         description: Error interno del servidor
 */

router.get("/", verificacion.verifyToken, (req, res, next) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      const desde = Number(req.query.desde) || 0;
      const hasta = Number(req.query.hasta) || 5;

      models.facultad
        .findAll(
          {
            offset: desde,
            limit: hasta,
            attributes:
              [
                "id",
                "nombre",
                "director"
              ],
            include:
              [
                {
                  as: 'Carrera-Relacionada',
                  model: models.carrera,
                  attributes:
                    [
                      "id",
                      "nombre"
                    ]
                }
              ]
          })
        .then(facultad => res.send(facultad))
        .catch(() => res.sendStatus(500));
    }
  });
});

/**
 * @swagger
 * /fac:
 *   post:
 *     summary: Inserta la información de una nueva facultad en la base de datos
 *     tags: [Facultades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la facultad
 *               director:
 *                 type: string
 *                 description: Director de la facultad
 *     responses:
 *       201:
 *         description: Creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la facultad creada
 *       400:
 *         description: Solicitud incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       500:
 *         description: Error interno del servidor
 */

router.post("/", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {

      models.facultad
        .create(
          {
            nombre: req.body.nombre,
            director: req.body.director
          })
        .then(facultad => res.status(201).send(
          { id: facultad.id }
        ))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otra facultad con el mismo nombre')
          }
          else {
            console.log(`Error al intentar insertar en la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
    }
  });


});

/**
 * @swagger
 * /fac/{id}:
 *   get:
 *     summary: Obtiene una facultad por su ID
 *     tags:
 *       - Facultades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la facultad
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la facultad
 *                 director:
 *                   type: string
 *                   description: director de la facultad
 *                 Carrera-Relacionada:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la carrera asociada
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la carrera asociada
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 */

const findFacultad = (id, { onSuccess, onNotFound, onError }) => {
  models.facultad
    .findOne({
      attributes:
        [
          "id",
          "nombre",
          "director"
        ],
      include:
        [
          {
            as: 'Carrera-Relacionada',
            model: models.carrera,
            attributes:
              [
                "id",
                "nombre"
              ]
          }
        ],
      where:
      {
        id
      }
    })
    .then(facultad => (facultad ? onSuccess(facultad) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      findFacultad(req.params.id, {
        onSuccess: facultad => res.send(facultad),
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /fac/{id}:
 *   put:
 *     summary: Actualiza una facultad por su ID
 *     tags:
 *       - Facultades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la facultad
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Solicitud incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       404:
 *         description: Carrera no encontrada
 *       500:
 *         description: Error interno del servidor
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la facultad a actualizar
 *         required: true
 *         type: integer
*/

router.put("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      const onSuccess = facultad =>
        facultad
          .update(
            {
              nombre: req.body.nombre
            },
            {
              fields: ["nombre"]
            })
          .then(() => res.sendStatus(200))
          .catch(error => {
            if (error == "SequelizeUniqueConstraintError: Validation error") {
              res.status(400).send('Bad request: existe otra facultad con el mismo nombre')
            }
            else {
              console.log(`Error al intentar actualizar la base de datos: ${error}`)
              res.sendStatus(500)
            }
          });
      findFacultad(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /fac/{id}:
 *   delete:
 *     summary: Elimina una facultad por su ID en la base de datos
 *     tags: [Facultades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 */

router.delete("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      const onSuccess = facultad =>
        facultad
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findFacultad(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

module.exports = router;
