const socketCliente = io();

const formNewProduct = document.querySelector(`#newProduct`)
const title = document.getElementById('title')
const price = document.getElementById('price')
const thumbnail = document.getElementById('thumbnail')
const productoTable = document.querySelector('.productos-handlebars')
console.log(productoTable);


/* --------------- render de tablas en el template handlebars --------------- */
function renderTable( products){
    return fetch('./views/partials/tables.hbs')
    .then(resp =>resp.text())
    .then(table =>{
        console.log(table);
        const template = Handlebars.compile(table)

        const html = template ({productos:products})
        console.log(html);
        return html
    })
}

//TODO: primer carga de productos (sucede con el metodo get creo)
formNewProduct.addEventListener('submit', event =>{
    event.preventDefault()
    const newProducto = {
        title: title.value,
        price: price.value,
        thumbnail: thumbnail.value
    }
    socketCliente.emit('newProduct',newProducto)

})

socketCliente.on('refreshTable',  (productosAll)=>{
    console.log("ingresa aca");
    renderTable(productosAll)
    .then(html => {
        console.log(productoTable);
        console.log(html);
        productoTable.innerHTML = html
    })
});

