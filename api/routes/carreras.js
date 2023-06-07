var express = require("express");
var router = express.Router();
var models = require("../models");

/**
 * @swagger
 * /car:
 *   get:
 *     summary: Obtiene las
 *     tags:
 *       - Carrera
 *     parameters:
 *       - name: desde
 *         in: query
 *         description: Número de página
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: hasta
 *         in: query
 *         description: Tamaño de página
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 carrera:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la carrera
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la carrera
 *                       id_facultad:
 *                         type: integer
 *                         description: id de la facultad a la que esta relacionada
 *                       carrera:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la carrera
 *                       Facultad-Relacionada:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID de la facultad
 *                             nombre:
 *                               type: string
 *                               description: Nombre de la facultad
 *                             director:
 *                               type: object
 *                               properties:
 *                                 nombre:
 *                                   type: string
 *                                   description: nombre director
 *               currentPage:
 *                 type: integer
 *                 description: Página actual
 *               totalPages:
 *                 type: integer
 *                 description: Número total de páginas
 *               totalCount:
 *                 type: integer
 *                 description: Total de alumnos
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", (req, res, next) => {
  const desde = Number(req.query.desde) || 0;
  const hasta = Number(req.query.hasta) || 5;
  console.log("Esto es un mensaje para ver en consola");
  models.carrera
    .findAll({
      offset: desde, limit: hasta,
      attributes: ["id", "nombre", "id_facultad"],//,"id_facultad" ni bien pongo esto, me tira error
      include: [{ as: 'Facultad-Relacionada', model: models.facultad, attributes: ["id", "nombre", "director"] },// si agrego esta linea, tambien me tira error
      { as: 'materia', model: models.materia, attributes: ["id", "nombre"] }]//,
      //  {as:'Facultad-Relacionada', model:models.facultad,attributes:["id","nombre","director"]}
      //ASOCIACION
    })
    .then(carrera => res.send(carrera))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
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
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
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
});

router.delete("/:id", (req, res) => {
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
});

module.exports = router;
