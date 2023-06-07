var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res, next) => {
  const desde = Number(req.query.desde) || 0;
  const hasta = Number(req.query.hasta) || 5;
  console.log("Esto es un mensaje para ver en consola");
  models.profesor
    .findAll({
      offset: desde, limit: hasta,
      attributes: ["id", "nombre", "apellido","id_materia"],
      include:[{as:'materia', model:models.materia, attributes: ["id","nombre"]}] //ASOCIACION
    })
    .then(profesor => res.send(profesor))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  //console.log(`Valor de id_carrera en req.body: ${req.body.id_carrera}`);
  console.log(req.body.id_materia);
  models.profesor
    .create({ 
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        id_materia: req.body.id_materia
    })
    .then(profesor => res.status(201).send({ id: profesor.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findProfesor = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor
    .findOne({
      attributes: ["id", "nombre", "apellido", "id_materia"],
      where: { id }
    })
    .then(profesor => (profesor ? onSuccess(profesor) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findProfesor(req.params.id, {
    onSuccess: profesor => res.send(profesor),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = profesor =>
  profesor
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] }) //ACTUALIZAR APELLIDO COMO ES
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
});

router.delete("/:id", (req, res) => {
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
});

module.exports = router;