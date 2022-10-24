const socketCliente = io();
/* ------------------------- variables de productos ------------------------- */
const formNewProduct = document.querySelector(`#newProduct`)
const title = document.getElementById('title')
const price = document.getElementById('price')
const thumbnail = document.getElementById('thumbnail')
const productoTable = document.querySelector('.productos-handlebars')
/* --------------------------- variables del chat --------------------------- */
const chatMsj = document.querySelector('#enviarMsj')
const mensajeUsuario = document.querySelector('#msj')
const mailUsuario = document.querySelector('#mail')
const msjUsuario = document.querySelector('#id')
const mostrarMsj = document.querySelector('.mostrarMsj')
const historialMsj = document.querySelector('.mensajeRecibido')

/* --------------- render de tablas en el template handlebars --------------- */
function renderTable( products){
    return fetch('./views/partials/tables.hbs')
    .then(resp =>resp.text())
    .then(table =>{
        const template = Handlebars.compile(table)
        const htmlProductos = template ({productos:products})
        return htmlProductos
    })
}
/* --------------------------- carga de productos --------------------------- */
formNewProduct.addEventListener('submit', event =>{
    event.preventDefault()
    const newProducto = {
        title: title.value,
        price: price.value,
        thumbnail: thumbnail.value
    }
    socketCliente.emit('newProduct',newProducto)
})
/* --------------------------- render de productos -------------------------- */
socketCliente.on('refreshTable', async  (productosAll)=>{
    const html = await renderTable(productosAll)
    productoTable.innerHTML = html
});

/* --------------- render de chats en el template handlebars --------------- */
function renderMsjs( msjs){
    return fetch('./views/partials/mensajes.hbs')
    .then(resp =>resp.text())
    .then( lista =>{
        const template = Handlebars.compile(lista)
        const htmlMsjs = template ({msjs})
        return htmlMsjs
    })
}
/* ------------------------------- mostrat todos los msj ------------------------------- */
socketCliente.on('allMensajes', async mensajes =>{
    const html = await renderMsjs(mensajes)
    mostrarMsj.innerHTML = html
})
/* ------------------------------- mandar msj por chat ------------------------------- */
chatMsj.addEventListener('submit', event =>{
    event.preventDefault()
    const newMsjChat = {
        mail: mailUsuario.value,
        msj: mensajeUsuario.value,
        fecyHora: new Date().toLocaleString()
    }
    socketCliente.emit('newMsjChat',newMsjChat)
    chatMsj.reset();
})
/* --------------------------- render de mensajes -------------------------- */
socketCliente.on('refreshChat', async  (msjsAll)=>{
    const html = await renderMsjs(msjsAll)
    mostrarMsj.innerHTML = html
});