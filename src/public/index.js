const socketCliente = io();

const formNewProduct = document.querySelector(`#newProduct`)

/* --------------- render de tablas en el template handlebars --------------- */
function renderTable( products){
    return fetch('./views/partials/tables.hbs')
    .then(resp => resp.text())
    .then(table =>{
        const template = Handlebars.compile(table);
        const html = template ({products})
        return html
    })
}


socketCliente.on('products', function(data){
    render (data)
});


formNewProduct.addEventListener('submit', event =>{
    socketCliente.emit('newProduct',event)

})

socketCliente.on('refreshTable', (data )=>{
    location.reload()
})