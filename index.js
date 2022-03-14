var http = require("http");
var url = require("url");
var fs = require('fs');

var moduloBd = require("./my_modules/bd.js");

http
  .createServer(function (peticion, respuesta) {
    respuesta.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  });
    var url_peticion = url.parse(peticion.url, true);
    var pathname = url_peticion.pathname;
    console.log(pathname);
    if (pathname == "/") {
      respuesta.writeHead(200, { 
        "Content-Type": "text/html;charset=utf-8" , 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      });
      respuesta.write("<p>Servidor Node para DWST4</p>");
      var readSream = fs.createReadStream('index.html','utf8');
      readSream.pipe(respuesta);
      //respuesta.end();
    } else if (pathname == "/importar") {
      respuesta.writeHead(200, { 
        "Content-Type": "application/json" , 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      });
      return moduloBd.importar(respuesta, "./data/harry-potter-characters.json");
    } else if (pathname == "/consultas") {
      let parametros = url_peticion.query;
      if (parametros.code !== undefined) {
        moduloBd.consultas(respuesta, parametros.code, function (salida) {
          respuesta.writeHead(200, { 'Content-Type': 'application/json' ,  'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        });
        console.log(parametros);
          respuesta.write(JSON.stringify(salida));
          respuesta.end();
        });
      } else {
        respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8",  'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      });
        respuesta.write("<p>Para hacer una consulta debe indicar el código de la misma</p>");
        respuesta.end();
      }
    } else if (pathname == "/insertar") {
      let parametros = url_peticion.query;
      if (parametros.name !== undefined) {
        return moduloBd.insertar(respuesta, parametros);
      } else {
        respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8", 'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      });
        respuesta.write("<p>Para hacer una actualización debe indicar el código de la misma</p>");
        respuesta.end();
      }
    } else if (pathname == "/borrar") {
      let parametros = url_peticion.query;
      if (parametros.code !== undefined) {
        return moduloBd.borrar(respuesta, parametros.code);
      } else {
        respuesta.writeHead(200, { "Content-Type": "text/html;charset=utf-8",  'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      });
        respuesta.write("<p>Para hacer un borrado debe indicar el código de la misma</p>");
        respuesta.end();
      }
    } else {
      respuesta.writeHead(404, { "Content-Type": "text/html;charset=utf-8", 'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
      respuesta.write("<p>Lo sentimos, la ruta indicada no existe.</p>");
      respuesta.end();
    }
  })
  .listen(8085, "localhost"),
  (err) => {
    if (err) {
      return console.log("Error: ", err);
    }
    console.log("Servidor ejecutándose en localhost:8085/");
  };
