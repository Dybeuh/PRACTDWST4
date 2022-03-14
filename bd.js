var fs = require("fs");
var mongo = require("mongodb");

var MongoCli = mongo.MongoClient;
var mongoUrl = "mongodb://localhost:27017/";

errores = function (texto, respuesta) {
  let salida = texto;
  respuesta.writeHead(500, { "Content-Type": "text/html;charset=utf-8", 
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
});
  respuesta.write(salida);
  respuesta.end();
  console.error(texto);
}

exports.importar = function (respuesta, rutaJson) {
  console.log(respuesta);
  MongoCli.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) errores(err.errmsg, respuesta);
    else {
      var dbo = db.db("harry");
      dbo.createCollection("personajes", function (err, res) {
        if (err) errores(err.errmsg, respuesta);
        else {
          console.log("Colección creada!");
          fs.readFile(rutaJson, function (err, dato) {
            if (err) errores(err.errmsg, respuesta);
            else {
              let datos = JSON.parse(dato);
              dbo.collection("personajes").insertMany(datos, function (err, res) {
                if (err) errores(err.errmsg, respuesta);
                else {
                  console.log("Se han insertado " + res.insertedCount + " documentos");
                  db.close();
                  let salida =
                    "<p>La base de datos y la colección ha sido creada correctamente. Los datos se han importado correctamente.</p>";
                  respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8" , 
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
                });
                  respuesta.write(salida);
                  respuesta.end();
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.consultas = function (respuesta, codigo, miCallback) {
  let codigoInt = parseInt(codigo);
  let query;
  switch (codigoInt) {
    case 1:
      query = {};
      break;
    case 2:
      query = { species: "human" };
      break;
    case 3:
      query = { yearOfBirth: { $lt: 1979 } };
      break;
    case 4:
      query = { "wand.wood": "holly" };
      break;
    case 5:
      query = {
        $and: [{ alive: true }, { hogwartsStudent: true }],
      };
      break;
    default:
      errores("consulta erronea", respuesta);
      return;
  }

  MongoCli.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) {
      throw err;
    }
    var dbo = db.db("harry");
    dbo
      .collection("personajes")
      .find(query)
      .toArray(function (err, result) {
        if (err) errores(err.errmsg, respuesta);
        else {
          //console.log(result);
          db.close();
          return miCallback(result);
        }
      });
  });
};

exports.insertar = function (respuesta, values) {
  MongoCli.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) errores(err.errmsg, respuesta);
    else {
      var dbo = db.db("harry");
      dbo.collection("personajes").insertOne(values, function (err, res) {
        if (err) errores(err.errmsg, respuesta);
        else {
          console.log(res);
          db.close();
          let salida = "<p>Se ha hecho la actualización correctamente de " + res.modifiedCount + " documentos.</p>";
          respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8" , 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        });
          respuesta.write(salida);
          respuesta.end();
        }
      });
    }
  });
};

exports.borrar = function (respuesta, id) {
  let query = { _id: new mongo.ObjectID(id) };
  MongoCli.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) {
      throw err;
    }
    var dbo = db.db("harry");
    dbo.collection("personajes").deleteOne(query, function (err, deleteOK) {
      if (err) errores(err.errmsg, respuesta);
      else {
        if (deleteOK) {
          let salida = "El borrado se ha realizado correctamente.";
          respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8" , 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        });
          respuesta.write(salida);
          respuesta.end();
        } else {
          respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8" , 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        });
          respuesta.write("El borrado no ha podido realizarse.");
          respuesta.end();
        }
        db.close();
      }
    });
  });
};
