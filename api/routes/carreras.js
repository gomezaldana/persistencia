var express = require("express");
var router = express.Router();
var models = require("../models");
var sw = require("../config/configSwagger");
const jwt = require('jsonwebtoken');
const app = require("../app");
const verificacion = require("../verificacionToken");

/**
 * @swagger
 * /car:
 *   get:
 *     summary: Obtiene las carreras almacenas en la base de datos
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
 *       - Carreras
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
 *                     description: ID de la carrera
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la carrera
 *                   id_facultad:
 *                     type: integer
 *                     description: id de la facultad a la que esta relacionada
 *                   Facultad-Relacionada:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la facultad
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la facultad
 *                       director:
 *                         type: string
 *                         description: Director de la facultad
 *                   Materia:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID de la materia
 *                         nombre:
 *                           type: string
 *                           description: Nombre de la materia
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

      models.carrera
        .findAll(
          {
            offset: desde,
            limit: hasta,
            attributes:
              [
                "id",
                "nombre",
                "id_facultad"
              ],
            include:
              [
                {
                  as: 'Facultad-Relacionada',
                  model: models.facultad,
                  attributes:
                    [
                      "id",
                      "nombre",
                      "director"
                    ]
                },
                {
                  as: 'Materia-Relacionada',
                  model: models.materia,
                  attributes:
                    [
                      "id",
                      "nombre"
                    ]
                }
              ]
          })
        .then(carrera => res.send(carrera))
        .catch(() => res.sendStatus(500));
    }
  });
});



/**
 * @swagger
 * /car:
 *   post:
 *     summary: Inserta la información de una nueva carrera en la base de datos
 *     tags: [Carreras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la carrera
 *               id_facultad:
 *                 type: integer
 *                 description: ID de la facultad a la que está asociada
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
 *                   description: ID de la carrera creada
 *       400:
 *         description: Bad request
 *       500:
 *         description: Error interno del servidor
 */

router.post("/", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {

      models.carrera
        .create({
          nombre: req.body.nombre,
          id_facultad: req.body.id_facultad
        })
        .then(carrera => res.status(201).send({ id: carrera.id }))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
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
 * /car/{id}:
 *   get:
 *     summary: Obtiene una carrera por su ID
 *     tags:
 *       - Carreras
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
 *                   description: ID de la carrera
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la carrera
 *                 id_facultad:
 *                   type: string
 *                   description: ID de la facultad asociada a la carrera buscada
 *                 Facultad-Relacionada:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID de la facultad
 *                     nombre:
 *                       type: string
 *                       description: Nombre de la facultad
 *                     director:
 *                       type: string
 *                       description: Director de la facultad
 *                 Materia:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la materia
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la materia
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 */

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne(
      {
        attributes:
          [
            "id",
            "nombre"
          ],
        include:
          [
            {
              as: 'Facultad-Relacionada',
              model: models.facultad,
              attributes:
                [
                  "id",
                  "nombre",
                  "director"
                ]
            },
            {
              as: 'Materia-Relacionada',
              model: models.materia,
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
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {

      findCarrera(req.params.id, {
        onSuccess: carrera => res.send(carrera),
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /car/{id}:
 *   put:
 *     summary: Actualiza una carrera por su ID
 *     tags:
 *       - Carreras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la carrera
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Error interno del servidor
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la carrea a actualizar
 *         required: true
 *         type: integer
*/

router.put("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {

      const onSuccess = carrera =>
        carrera
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
              res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
            }
            else {
              console.log(`Error al intentar actualizar la base de datos: ${error}`)
              res.sendStatus(500)
            }
          });
      findCarrera(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });
});

/**
 * @swagger
 * /car/{id}:
 *   delete:
 *     summary: Elimina una carrera por su ID en la base de datos
 *     tags: [Carreras]
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

      const onSuccess = carrera =>
        carrera
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findCarrera(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });
});



module.exports = router;
