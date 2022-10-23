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
const PORT = process.env.PORT || 3000;


/* ------------------------------- configuracion del servidor ------------------------------- */
//Indicamos que queremos cargar los archivos estáticos que se encuentran en dicha carpeta
app.use(express.static(__dirname + '/public')) 
app.use(express.json());
app.use(express.urlencoded({extended: true}))


/* ---------------------- definicion motor de plantilla --------------------- */
app.engine('hbs', engine({extname: 'hbs'}))
app.set('views', __dirname+'/public/views') //ubicacion de templates
app.set('view engine', 'hbs') // definitar motor para express

//se crea el servidor y se enciende
httpServer.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));

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

/* ---------------------- Websocket --------------------- */
io.on('connection', async (socket)=>{
    console.log("nuevo usuario conectado");
    
    //productos inicial
    socket.emit('allProducts', await productos.getAll())
    //nuevo producto
    socket.on('newProduct', async newProducto =>{
        newProducto.price = parseFloat(newProducto.price);
        const verificaRequest = verificarRequest(newProducto)
        if(typeof(verificaRequest)!== "string"){ //Si devuelve String es un error
            await productos.save(newProducto)
            const productosAll = await productos.getAll()
            io.sockets.emit('refreshTable', productosAll)
        }

        
    })
})




