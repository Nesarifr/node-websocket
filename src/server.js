import express from 'express';
import * as HttpServer from 'http';
import * as IoServer from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
/* ------------------- import de clase contenedora y otros ------------------ */
import {Contenedor}  from './components/contenedor.js'
import {verificarRequest} from './components/utils.js'
/* --------------------------- constantes globales -------------------------- */

const productos = new Contenedor('producto.txt')

/* ------------------- constantes necesarias del servidor ------------------- */
const app = express();
const httpServer = new HttpServer.createServer(app); 
//io: servidor de Websocket
const io = new IoServer.Server(httpServer); //conectamos con el servidor principal Http
const __filename = fileURLToPath(import.meta.url); 
// ^^^ Esta es una variable especial que contiene toda la meta información relativa al módulo, de forma que podremos acceder al contexto del módulo.
const __dirname = path.dirname(__filename)


/* ------------------------------- configuracion del servidor ------------------------------- */
//Indicamos que queremos cargar los archivos estáticos que se encuentran en dicha carpeta
app.use(express.static(__dirname + '/public')) 
app.use(express.json());
app.use(express.urlencoded({extended: true}))


/* ---------------------- definicion motor de plantilla --------------------- */
app.engine('hbs', engine({extname: 'hbs'}))
app.set('views', __dirname+'/public/views') //ubicacion de templates
app.set('view engine', 'hbs') // definitar motor para express



/* --------- GET '/' -> devuelve todos los productos. --------- */
app.get('/', async (req, res)=>{
    try{
        const productosAll = await productos.getAll()
        if ( productosAll){
            res.render('home', {productos : productosAll})
            
        }  else res.render('partials/error', {productos: {error: 'No existe una lista de productos todavia'}})  
    }
    catch(error){
        res.status(500).send('Error en el servidor')
    }
});

/* ------  POST '/' -> recibe y agrega un producto, y lo devuelve con su id asignado. ----- */
app.post('/', async (req, res)=>{
    try{
        const nuevoProducto = req.body;
        req.body.price = parseFloat(req.body.price) //en el formulario es requerido que sea number
        const verificaRequest = verificarRequest(req.body);
        if(typeof(verificaRequest)!== "string"){ //Si devuelve String es un error
            await productos.save(nuevoProducto)
            res.redirect('/')
        } else res.render('partials/error', {productos: {error: verificaRequest}})        
    }catch(error){
        res.status(500).send('Error en el servidor')
    }    
})



/* ---------------------- Websocket --------------------- */
io.on('connection', (socketCliente)=>{
    socketCliente.on('newProduct', ({isTrusted}) =>{
        console.log(isTrusted);
        io.sockets.emit('refreshTable', 'Refrescar pagina')
    })
})




//se crea el servidor y se enciende
httpServer.listen(3000, ()=> console.log("Server listening on port 3000"));