let productsArray = []
let clearButton = document.getElementById('boton-vaciar')
let catalog = document.getElementById('items')
let cartList = document.getElementById('carrito')
let totalValue = document.getElementById('total')
let cart = []
let quantityOnCart = []

clearButton.addEventListener('click', clearCart)

fetch('../data.json')
    .then((response) => response.json())
    .then((products) => {
        productsArray = products,
            render(products),
            loadCartFromStorage(),
            renderCart()
    })

function render(products) {
    products.forEach((product) => {
        let container = document.createElement('div')
        container.classList.add('card', 'col-sm-4', 'm-1')

        let cardBody = document.createElement("div")
        cardBody.classList.add('card-body')

        let cardImage = document.createElement("img")
        cardImage.setAttribute('src', product.image)
        cardImage.setAttribute('alt', product.name)
        cardImage.classList.add('shopimg', 'mb-2')

        let cardTitle = document.createElement("h5")
        cardTitle.classList.add('card-title')
        cardTitle.innerText = product.name

        let cardPrice = document.createElement("p")
        cardPrice.classList.add('card-text')
        cardPrice.innerText = `$${product.price}`

        let cardStock = document.createElement("p")
        cardStock.classList.add('card-text')
        cardStock.innerText = `Stock: ${product.stock}`

        let cardButton = document.createElement("button")
        cardButton.classList.add('btn', 'btn-primary')
        cardButton.innerText = `Agregar al carrito`
        cardButton.setAttribute('mark', product.id)
        cardButton.addEventListener('click', addProductToCart)

        cardBody.append(cardImage)
        cardBody.append(cardTitle)
        cardBody.append(cardPrice)
        cardBody.append(cardStock)
        cardBody.append(cardButton)
        container.append(cardBody)
        catalog.append(container)
    })
}

function addProductToCart(event) {
    let product = event.target.getAttribute('mark')

    if (productsArray[product - 1].stock > 0 && productsArray[product - 1].stock != quantityOnCart[product - 1]) {
        Swal.fire({
            title: `¿Desea agregar este producto al carrito?`,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Agregar',
            denyButtonText: `Cancelar`,
            icon: 'question',
        }).then((result) => {
            if (result.isConfirmed) {
                cart.push(product)
                renderCart()
                productsArray[product - 1].stock
            }
        })
    } else {
        Swal.fire({
            title: `En este momento no contamos con stock :(`,
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: 'Ok',
            icon: 'info',
        })
    }
}

function renderCart() {
    saveCartToStorage()
    cartList.innerHTML = ''

    let cartWithoutRepeatedElements = [...new Set(cart)]

    cartWithoutRepeatedElements.forEach((itemId) => {
        let item = productsArray.filter((product) => {
            return product.id === parseInt(itemId)
        })

        let quantity = cart.reduce((total, id) => {
            return id === itemId ? total += 1 : total
        }, 0)
        quantityOnCart[itemId - 1] = quantity

        let linea = document.createElement('li')
        linea.classList.add('list-group-item', 'text-right', 'mx-2')
        linea.innerText = `${quantity} x ${item[0].name} - $${item[0].price}`

        let clearButton = document.createElement('button')
        clearButton.classList.add('btn', 'btn-danger', 'mx-5')
        clearButton.innerText = 'X'
        clearButton.dataset.item = itemId
        clearButton.addEventListener('click', deleteProduct)

        linea.append(clearButton)
        cartList.append(linea)
    })

    totalValue.innerText = `$${calculateTotalPrice()}`
}

function deleteProduct(event) {
    Swal.fire({
        title: `¿Desea eliminar el producto del carrito?`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Eliminar',
        denyButtonText: `Cancelar`,
        icon: 'warning',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Se ha eliminado el producto',
            })

            let id = event.target.dataset.item
            cart = cart.filter((cartId) => {
                return cartId != id
            })

            renderCart()
        }
    })
}

function clearCart() {
    Swal.fire({
        title: `¿Desea vaciar el carrito?`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Vaciar',
        denyButtonText: `Cancelar`,
        icon: 'warning',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Se ha vaciado el carrito',
            })
            cart = []
            cartList.innerHTML = ''
            totalValue.innerText = "$0"
            saveCartToStorage()
        }
    })
}

function calculateTotalPrice() {
    return cart.reduce((total, itemId) => {
        let item = productsArray.filter((product) => {
            return product.id === parseInt(itemId)
        })
        return total + item[0].price
    }, 0)
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart))
}

function loadCartFromStorage() {
    cart = JSON.parse(localStorage.getItem('cart'))
    if (cart.length !== 0) {
        Swal.fire({
            title: `Bienvenido de vuelta!`,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Continuar comprando',
            denyButtonText: `Empezar de nuevo`,
        }).then((result) => {
            if (result.isDenied) {
                cart = []
                cartList.innerHTML = ''
                totalValue.innerText = "$0"
                saveCartToStorage()
            }
        })
    }
}