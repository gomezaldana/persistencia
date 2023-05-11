'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {});
  profesor.associate = function(models) {
    
    //codigo de asociacion  (tiene muchos:)
  profesor.associate = function(models) {
  	profesor.belongsTo(models.materia,  // Modelo al que pertenece
    {
      as: 'materia',                 // nombre de mi relacion
      foreignKey: 'id_materia'       // campo con el que voy a igualar 
    })
  };

  };
  return profesor;
};