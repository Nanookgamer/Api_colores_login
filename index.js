import dotenv from "dotenv";
dotenv.config();
//-------------
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { leerColores,crearColor,borrarColor,actualizarColor,buscarUsuario } from "./db.js";

async function verificar(peticion,respuesta,siguiente){
    if(!peticion.headers.authorization){
        return respuesta.sendStatus(403);
    }

    let [,token] = peticion.headers.authorization.split(" ");

    try{

        let datos = await jwt.verify(token,process.env.SECRET);

        peticion.usuario = datos.id;

        siguiente();

    }catch(e){
        respuesta.sendStatus(403);
    }
}


const servidor = express();

servidor.use(cors());

servidor.use(express.json());

//servidor.use(express.static("./front"));

servidor.post("/login", async (peticion,respuesta) => {
    let {usuario,password} = peticion.body;

    if(!usuario || !usuario.trim() || !password || !password.trim()){
        return respuesta.sendStatus(403);
    }

    try{

        let posibleUsuario = await buscarUsuario(usuario);

        if(!posibleUsuario){
            return respuesta.sendStatus(403);
        }

        let coincide = await bcrypt.compare(password,posibleUsuario.password);

        if(!coincide){
            return respuesta.sendStatus(401);
        }

        let token = jwt.sign({ id : posibleUsuario._id },process.env.SECRET);

        respuesta.json({token});

    }catch(e){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.use(verificar);

servidor.get("/colores", async (peticion,respuesta) => {
    try{
        let colores = await leerColores(peticion.usuario);

        respuesta.json(colores);

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.post("/nuevo", async (peticion,respuesta) => {
    try{
        let {r,g,b} = peticion.body;
        let usuario = peticion.usuario;

        let id = await crearColor({r,g,b,usuario});

        respuesta.json({id});

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.delete("/borrar/:id", async (peticion,respuesta,siguiente) => {
    try{
        let cantidad = await borrarColor(peticion.params.id,peticion.usuario);

        if(cantidad){
            return respuesta.sendStatus(204);
        }

        siguiente();

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.patch("/actualizar/:id", async (peticion,respuesta,siguiente) => {
    try{
        let {existe,cambio} = await actualizarColor(peticion.params.id,peticion.body,peticion.usuario);

        if(cambio){
            return respuesta.sendStatus(204);
        }

        if(existe){
            return respuesta.json({ info : "no se actualizó el recurso" });
        }

        siguiente();
        

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.use((error,peticion,respuesta,siguiente) => {
        respuesta.status(400);//bad request
        respuesta.json({ error : "error en la petición" });
});

servidor.use((peticion,respuesta) => {
        respuesta.status(404);
        respuesta.json({ error : "recurso no encontrado" });
});


servidor.listen(process.env.PORT);


/* import express from "express";
import { leerColores, crearColor, borrarColor, actualizarColor, logIn, crearUsuario } from "./db.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const server = express();

server.use(cors());
server.use(express.static("./public"));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

async function verificar(peticion, respuesta, siguiente){

    if(!peticion.headers.authorization){
        return respuesta.sendStatus(403);
    }

    let [,token] = peticion.headers.authorization.split(" ");

    try{

        let datos = await jwt.verify(token, process.env.SECRET);

        peticion.usuario = datos.id;

        siguiente();

    }catch(e){

        respuesta.sendStatus(403);
    }
}

//Establece las views
server.set("view engine", "ejs");

server.post("/login", async (peticion, respuesta) => {
    const { usuario, password } = peticion.body;

    if(!usuario || !usuario.trim() || !password || !password.trim()){
        return respuesta.sendStatus(403);
    }

    try {

        /*

        let posibleUsuario = await buscarUsuario(usuario);

        if(!posibleUsuario){
            return respuesta.sendStatus(403)
        }

        let coincide = await bcrypt.compare(password,posibleUsuario.password);

        if(!coincide){
            return respuesta.sendStatus(401)
        }
        
        let token = jwt.sign({id : posibleUsuario._id}, process.env.SECRET);

        respuesta.json({token});

    } catch (error) {

        respuesta.sendStatus(500);
        
        respuesta.json({ error : "error en el servidor"});

    }

});

server.post("/signin", async (peticion, respuesta) => {

    try {

        const { nombre, password } = peticion.body;

        const resultado = await crearUsuario(nombre, password);

        respuesta.json(resultado);

    } catch (error) {

        respuesta.status(401).json(error);

    }

});

server.use(verificar);

server.get("/colores", async (peticion, respuesta) => {
    try {
        const colores = await leerColores(peticion.usuario.id);
        respuesta.json(colores);

    } catch (error) {
        respuesta.status(500);
        respuesta.json({ error: "Error en el servidor" });

    }
});

server.post("/nuevo", async (peticion, respuesta) => {

    try {

        const color = {
            ...peticion.body,
            id_usuario: peticion.usuario.id
        };

        const resultado = await crearColor(color);

        respuesta.json({ id: resultado.insertedId });

    } catch (error) {
        respuesta.status(500);
        respuesta.json({ error: "Error en el servidor" });

    }

});

server.delete("/borrar/:id", async (peticion, respuesta) => {
    try {
        const resultado = await borrarColor(peticion.params.id, peticion.usuario);

        if (resultado.deletedCount === 0) {
            return respuesta.status(404).json({ error: "Recurso no encontrado" });
        }

        return respuesta.sendStatus(204);

    } catch (error) {
        respuesta.status(500).json({ error: "Error en el servidor" });
    }
});

server.patch("/actualizar/:id", async (peticion, respuesta) => {
    try {
        const { existe, cambio } = await actualizarColor(
            peticion.params.id,
            peticion.body,
            peticion.usuario
        );

        if (cambio) {
            return respuesta.sendStatus(204);

        }

        if (existe) {
            return respuesta.json({ info: "No se actualizó el recurso" });

        }

        return respuesta.status(404).json({ error: "Recurso no encontrado" });

    } catch (error) {
        respuesta.status(500);
        respuesta.json({ error: "Error en el servidor" });

    }
});

server.get("/", (peticion, respuesta) => {
    respuesta.render("index");

});

server.use((peticion, respuesta) => {
    respuesta.status(404);
    respuesta.json({ error: "Recurso no encontrado" });

});

server.listen(3000);
 */