import dotenv from "dotenv";
dotenv.config();
//-------------
import {MongoClient,ObjectId} from "mongodb";

const urlMongo = process.env.MONGO_URL;

function conectar(){
    return MongoClient.connect(urlMongo);
}
//usuarios

export function buscarUsuario(nombreUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("usuarios");

            return coleccion.findOne({ usuario : nombreUsuario });
        })
        .then( usuario => {
            ok(usuario);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

//colores

export function leerColores(idUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.find({ usuario : idUsuario }).toArray();
        })
        .then( colores => {
            ok(colores);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function crearColor(objColor){ //{r,g,b,usuario}
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.insertOne(objColor);
        })
        .then( ({insertedId}) => {
            ok(insertedId);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function borrarColor(idColor,idUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.deleteOne({ _id : new ObjectId(idColor), usuario : idUsuario });
        })
        .then( ({deletedCount}) => {
            ok(deletedCount);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function actualizarColor(id,objCambios,idUsuario){ //{r,g,b}||{r}||{g}||{b}||cualquier combinación
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.updateOne({ _id : new ObjectId(id), usuario : idUsuario },{ $set : objCambios });
        })
        .then( ({modifiedCount,matchedCount}) => {
            ok({
                existe : matchedCount,
                cambio : modifiedCount
            });
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}




/* import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const urlMongo = "mongodb+srv://Sergio:12345abc@cluster0.zuptu9f.mongodb.net/";

function conectar() {
    return MongoClient.connect(urlMongo);
}

export function leerColores(idUsuario) {
    return new Promise((ok,ko) => {
        let conexion = null;

        conectar()
        .then(objconexion => {

            conexion = objconexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.find({ usuario: idUsuario }).toArray();

        })
        .then(colores => ok(colores))
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });

    });
}

export function crearColor(color) {
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objconexion => {
            conexion = objconexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.insertOne(color);

        })
        .then( resultado => {

            ok(resultado);

        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });

    });

}

export function borrarColor(idColor, idUsuario) {
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objconexion => {
            conexion = objconexion;

            let coleccion = conexion.db("colores").collection("colores");

            return deleteOne({
                _id: new ObjectId(idColor),
                usuario: idUsuario
            })

        })
        .then( resultado => {

            ok(resultado);

        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });

    });

}

export function actualizarColor(idColor, objCambios, idUsuario) {
    return new Promise((ok, ko) => {
        let conexion = null;
        conectar()
        .then(objconexion => {
            conexion = objconexion;

            let coleccion = conexion.db("colores").collection("colores");

            return updateOne({
                _id: new ObjectId(idColor),
                usuario: idUsuario
            },
            { $set: objCambios })
        })
        .then( ({modifiedCount, matchedCount}) => {
            ok({
                existe : matchedCount,
                cambio : modifiedCount
            });

        })
        .catch(() => ko({ error: "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function logIn(usuario, password) {

    return new Promise(async (ok, ko) => {

        let conexion = null;

        try {

            conexion = await conectar();

            const coleccion = conexion.db("colores").collection("usuarios");

            const usuario = await coleccion.findOne({ usuario });

            if (!usuario) {
                return ko({ error: "el usuario no existe" });
            }

            const valido = await bcrypt.compare(password, usuario.password);

            if (!valido) {
                return ko({ error: "contraseña incorrectos" });
            }

            const token = jwt.sign(
                { id: usuario._id },
                SECRET,
                { expiresIn: "10m" }
            );

            ok({ token });

        } catch (error) {

            ko({ error: "error en bbdd" });

        } finally {

            if (conexion) conexion.close();

        }

    });

}

export function crearUsuario(usuario, password) {
    return new Promise(async (ok, ko) => {

        let conexion = null;

        try {

            conexion = await conectar();

            const coleccion = conexion.db("colores").collection("usuarios");

            const hash = await bcrypt.hash(password, 10);

            const resultado = await coleccion.insertOne({
                usuario,
                password: hash
            });

            ok(resultado);

        } catch (error) {

            ko({ error: "error en bbdd" });

        } finally {

            if (conexion) conexion.close();

        }
    });
}

export function borrarUsuario(id){

    return new Promise((ok, ko) => {

        let conexion = null;

        conectar()
        .then(objconexion => {

            conexion = objconexion;

            let coleccion = conexion.db("colores").collection("usuarios");

            return coleccion.deleteOne({
                _id: new ObjectId(id)
            });

        })
        .then(resultado => ok(resultado))
        .catch(() => ko({ error: "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });

    });

}
 */