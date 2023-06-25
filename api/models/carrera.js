'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING,
    id_facultad: DataTypes.INTEGER
  }, {});
  
  //codigo de asociacion  (tiene muchos:)
  carrera.associate = function(models) {

  	carrera.hasMany(models.materia,  // Modelo al que pertenece
    {
      as: 'Materia-Relacionada',                 // nombre de mi relacion
      foreignKey: 'id_carrera'       // campo con el que voy a igualar 
    }),
    //hola soy un cambio

    carrera.belongsTo(models.facultad,
      {
        as:'Facultad-Relacionada',
        foreignKey: 'id_facultad'
      })
  };

  return carrera;
};