'use strict';
module.exports = (sequelize, DataTypes) => {
  const facultad = sequelize.define('facultad', {
    nombre: DataTypes.STRING,
    director: DataTypes.STRING
  }, {});

  facultad.associate = function (models) {
    //codigo de asociacion  (tiene muchos:)
    facultad.hasMany(models.carrera,  // Modelo al que pertenece
      {
        as: 'mi_carrera',                 // nombre de mi relacion
        foreignKey: 'id_facultad'       // campo con el que voy a igualar 
      })
  };

  return facultad;
};
