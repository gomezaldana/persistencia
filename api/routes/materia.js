var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require('jsonwebtoken');
const verificacion = require("../verificacionToken");

/**
 * @swagger
 * /mat:
 *   get:
 *     summary: Obtiene las materias almacenadas en la base de datos
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
 *       - Materias
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
 *                     description: ID de la materia
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la materia
 *                   id_carrera:
 *                     type: integer
 *                     description: id de la carrera a la que esta relacionada
 *                   Carrera-Relacionada:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la carrera
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la carrera
 *                       director:
 *                         type: string
 *                         description: Director de la facultad //falta id y director
 *                   Profesor-Relacionado:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID del profesor
 *                         nombre:
 *                           type: string
 *                           description: Nombre del profesor
 *                         apellido:
 *                           type: string
 *                           description: Apellido del profesor /7falta id materia
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

      models.materia
        .findAll(
          {
            offset: desde,
            limit: hasta,
            attributes:
              [
                "id",
                "nombre",
                "id_carrera"
              ],
            include:
              [
                {
                  as: 'Carrera-Relacionada',
                  model: models.carrera,
                  attributes:
                    [
                      "id",
                      "nombre",
                      "id_facultad"
                    ]
                },
                {
                  as:
                    'Profesor-Relacionado',
                  model: models.profesor,
                  attributes:
                    [
                      "id",
                      "nombre",
                      "apellido"
                    ]
                }
              ]
          })
        .then(materia => res.send(materia))
        .catch(() => res.sendStatus(500));
    }
  });

});


/**
 * @swagger
 * /mat:
 *   post:
 *     summary: Inserta la información de una nueva materia en la base de datos
 *     tags: [Materias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la materia
 *               id_carrera:
 *                 type: integer
 *                 description: ID de la carrera a la que está asociada
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
 *                   description: ID de la materia creada
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

      models.materia
        .create(
          {
            nombre: req.body.nombre,
            id_carrera: req.body.id_carrera
          }
        )
        .then(materia => res.status(201).send(
          { id: materia.id }
        ))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otra materia con el mismo nombre')
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
 * /mat/{id}:
 *   get:
 *     summary: Obtiene una materia por su ID
 *     tags:
 *       - Materias
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
 *                   description: ID de la materia
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la materia
 *                 id_carrera:
 *                   type: string
 *                   description: ID de la id_carrera asociada a la materia buscada
 *       404:
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 */

const findMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne(
      {
        attributes:
          [
            "id",
            "nombre",
            "id_carrera"
          ],
        include:
          [
            {
              as: 'Carrera-Relacionada',
              model: models.carrera,
              attributes:
                [
                  "id",
                  "nombre",
                  "id_facultad"
                ]
            },
            {
              as:
                'Profesor-Relacionado',
              model: models.profesor,
              attributes:
                [
                  "id",
                  "nombre",
                  "apellido"
                ]
            }
          ],
        where:
        {
          id
        }
      })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      findMateria(req.params.id, {
        onSuccess: materia => res.send(materia),
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /mat/{id}:
 *   put:
 *     summary: Actualiza una materia por su ID
 *     tags:
 *       - Materias
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la materia
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
 *         description: Not Found
 *       500:
 *         description: Error interno del servidor
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la materia a actualizar
 *         required: true
 *         type: integer
*/

router.put("/:id", verificacion.verifyToken, (req, res) => {

  jwt.verify(req.token, 'secretKey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      const onSuccess = materia =>
        materia
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
              res.status(400).send('Bad request: existe otra materia con el mismo nombre')
            }
            else {
              console.log(`Error al intentar actualizar la base de datos: ${error}`)
              res.sendStatus(500)
            }
          });
      findMateria(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

/**
 * @swagger
 * /mat/{id}:
 *   delete:
 *     summary: Elimina una materia por su ID en la base de datos
 *     tags: [Materias]
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
      const onSuccess = materia =>
        materia
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findMateria(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    }
  });


});

module.exports = router;
