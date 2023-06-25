'use strict';
module.exports = (sequelize, DataTypes) => {
  const facultad = sequelize.define('facultad', {
    nombre: DataTypes.STRING,
    director: DataTypes.STRING
  }, {});

  facultad.associate = function (models) {
    facultad.hasMany(models.carrera,  
      {
        as: 'Carrera-Relacionada',                 
        foreignKey: 'id_facultad'       
      })
  };

  return facultad;
};
