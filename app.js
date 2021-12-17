const cards = document.getElementById('cards');//guardar los ids
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;//guardar el template
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
console.log('@fragment ',fragment)

let carrito = {};


document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  if (localStorage.setItem('carrito')) {
    carrito = JSON.parse(localStorage.getItem('carrito'));
    pintarCarrito();
  }
})

cards.addEventListener('click',e =>{
  addCarrito(e);

})

items.addEventListener('click', e => {
  btnAccion(e);
})

  const fetchData = async () => {
    try{
       
      const res = await fetch('http://127.0.0.1:5500/CarritoCompras/api.json')
        const data = await res.json()
        pintarCards(data)
    }catch(error){
        console.log(error);
    }
  }
  
const pintarCards = data => {
    data.forEach(producto => {
      templateCard.querySelector('h5').textContent = producto.title;
      templateCard.querySelector('p').textContent = producto.precio;
      templateCard.querySelector('img').setAttribute("srcset",producto.thumbnailUrl);
      templateCard.querySelector('.btn-dark').dataset.id = producto.id;
      const clone = templateCard.cloneNode(true); //crea un clo del template con los datos del poducto 
      fragment.appendChild(clone) // inserta el clon dentro del fragment
    })
    cards.appendChild(fragment) 
}   

const addCarrito = e =>{
  //alert('boton funcionando');
  //console.log('@target',e.target.classList.contains('btn-dark'))
  if (e.target.classList.contains('btn-dark')) {
    setCarrito(e.target.parentElement)

  }
  e.stopPropagation()
}

const setCarrito = objeto => {
  const producto = {
    id : objeto.querySelector('.btn-dark').dataset.id,// en el html se pueden poner clases custom llamandolas data-* 
    //y luego se accede a ella desde js con elemento.dataset.*  * es el nombre custom de la propiedad
    title: objeto.querySelector('h5').textContent,
    precio: objeto.querySelector('p').textContent,
    cantidad: 1
  }
  
  if (carrito.hasOwnProperty(producto.id)) {
    //El método hasOwnProperty() devuelve un booleano indicando si el objeto tiene la propiedad especificada
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }
  carrito[producto.id] = {...producto};
  pintarCarrito(producto);
}

const pintarCarrito = () =>{
  console.log('@carrito: ',Object.values(carrito));
  items.innerHTML = '';//limpia el html anterior y muestra solo el nuevo
  Object.values(carrito).forEach(producto => { //el object.values es porque el forEach solo aplica a arrays y carrito es un objeto, 
    //entonces lo convierte a array, es mas sencillo de esta forma que que con un for in, porque ese tambien entrega las propiedades
    //y no nos interesan, solo el contenido, cada pos de array contiene un objeto porque carrito es una coleccion de objetos
    templateCarrito.querySelector('th').textContent = producto.id; //lleva al html al th del template el valor que tiene el objeto actual en id
    templateCarrito.querySelectorAll('td')[0].textContent = producto.title;// como hay varios td se usa el querySelectorAll, y se indica la posicion, en este caso es el primero
    templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
    templateCarrito.querySelector('.btn-info').dataset.id = producto.id; //el datase le adiciona el atributo data-id al boton de  la clase btn-info y le da el valor del id del producto actual
    templateCarrito.querySelector('.btn-danger').dataset.id = producto.id; // el punto antes de btn-danger indica que es una clase, cuando es un tag solo se pone el nombre
    templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio; // aunque el span esta dentro de un td, al ser el unico span del template se puede asociar directamente a el

    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
  })
  items.appendChild(fragment);// inserta el fragment dentro del elemento de htm que tiene id = items
  pintarFooter();

  localStorage.setItem('carrito',JSON.stringify(carrito));//en el local storage se guarda SecurityPolicyViolationEvent, el stringifylo pasa a coleccion de objetos
}

const pintarFooter = () =>{
  footer.innerHTML = '';
  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`;
    return;
  }
  const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad,0);
  const nPrecio = Object.values(carrito).reduce((acc, {cantidad,precio}) => acc + cantidad * precio,0);

  templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
  templateFooter.querySelectorAll('td')[2].textContent = nPrecio;
  
  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);
  footer.appendChild(fragment);

  const btnVaciar = document.getElementById('vaciar-carrito');
  btnVaciar.addEventListener('click', () => {
    carrito = {};
    pintarCarrito();
  })
}

const btnAccion = e => {
  //aumentar cantidad
  if (e.target.classList.contains('btn-info')) {
    const producto = carrito[e.target.dataset.id];
    producto.cantidad ++;
    carrito[e.target.dataset.id] = {...producto}
    pintarCarrito()
  }

  //disminuir cantidad
  if (e.target.classList.contains('btn-danger')) {
    const producto = carrito[e.target.dataset.id];
    producto.cantidad--;
    if (producto.cantidad === 0) {
      delete carrito[e.target.dataset.id];
    }
    
    pintarCarrito()
  }
  e.stopPropagation();
}

