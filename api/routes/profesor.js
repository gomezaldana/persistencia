var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require('jsonwebtoken');
const verificacion = require("../verificacionToken");
const secretKey = process.env.SECRET_KEY;

/**
 * @swagger
 * /pro:
 *   get:
 *     summary: Obtiene los profesores almacenados en la base de datos
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
 *       - name: Authorization
 *         in: header
 *         description: Token de autenticación
 *         required: true
 *         schema:
 *           type: string
 *           format: bearer
 *     tags:
 *       - Profesores
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
 *                     description: ID del profesor
 *                   nombre:
 *                     type: string
 *                     description: Nombre del profesor
 *                   apellido:
 *                     type: string
 *                     description: Apellido del profesor
 *                   id_materia:
 *                     type: integer
 *                     description: id de la materia a la que esta relacionado
 *                   Materia-Relacionada:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la materia
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la materia
 *       403:
 *         description: Acceso no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verificacion.verifyToken, (req, res, next) => {
  const desde = Number(req.query.desde) || 0;
  const hasta = Number(req.query.hasta) || 5;

  models.profesor
    .findAll({
      offset: desde,
      limit: hasta,
      attributes: ["id", "nombre", "apellido", "id_materia"],
      include: [
        {
          as: 'Materia-Relacionada',
          model: models.materia,
          attributes: ["id", "nombre"]
        }
      ]
    })
    .then(profesor => res.send(profesor))
    .catch(() => res.sendStatus(500));
});


/**
 * @swagger
 * /pro:
 *   post:
 *     summary: Inserta la información de un nuevo profesor en la base de datos
 *     tags: [Profesores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del profesor
 *               apellido:
 *                 type: string
 *                 description: Apellido del profesor
 *               id_materia:
 *                 type: integer
 *                 description: ID de la materia a la que está asociada
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID del profesor creado
 *       400:
 *         description: Bad request
 *       500:
 *         description: Error interno del servidor
 */

router.post("/", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, secretKey, (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {

      models.profesor
        .create({
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          id_materia: req.body.id_materia
        })
        .then(profesor => res.status(201).send(
          { id: profesor.id }
        ))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
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
 * /pro/{id}:
 *   get:
 *     summary: Obtiene un profesor por su ID
 *     tags:
 *       - Profesores
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
 *                   description: ID del profesor
 *                 nombre:
 *                   type: string
 *                   description: Nombre del profesor
 *                 id_materia:
 *                   type: string
 *                   description: ID de la materia asociada al profesor buscado
 *                 Materia-Relacionada:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID de la materia
 *                     nombre:
 *                       type: string
 *                       description: Nombre de la materia
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 */

const findProfesor = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor
    .findOne(
      {
        attributes:
          [
            "id",
            "nombre",
            "apellido",
            "id_materia"
          ],
        include:
          [
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
    .then(profesor => (profesor ? onSuccess(profesor) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, secretKey, (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      findProfesor(req.params.id, {
        onSuccess: profesor => res.send(profesor),
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /pro/{id}:
 *   put:
 *     summary: Actualiza un profesor por su ID
 *     tags:
 *       - Profesores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del profesor
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del profesor a actualizar
 *         required: true
 *         type: integer
*/

router.put("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, secretKey, (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      const onSuccess = profesor =>
        profesor
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
              res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
            }
            else {
              console.log(`Error al intentar actualizar la base de datos: ${error}`)
              res.sendStatus(500)
            }
          });
      findProfesor(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /pro/{id}:
 *   delete:
 *     summary: Elimina un profesor por su ID en la base de datos
 *     tags: [Profesores]
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

  jwt.verify(req.token, secretKey, (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      const onSuccess = profesor =>
        profesor
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findProfesor(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

module.exports = router;