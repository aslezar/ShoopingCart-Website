const client = contentful.createClient({
    space: "qishoqge3lc9",
    accessToken: "5zplASEB5n4VxDnSmixxE4wvjJ8u2QBbjFPwTN-tDaI"
});
// console.log(client);

//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products-center");

//cart
// let cart = [
//     {
//         "id": "1"
//     },
//     {
//         "id": "2"
//     }
// ];
let cart = [];
//Buttons
let buttonDOM = [];

//To get products 
class Products {
    async getProducts() {
        try {
            const response = await client.getEntries({
                content_type: 'product'
            });
            // console.log(response.items);

            // const result = await fetch('products.json');
            // const data = await result.json();

            let products = response.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const { url: image } = item.fields.image.fields.file;
                return { title, price, id, image };
            })
            return products;
        }
        catch (error) {
            console.log(error);
        }
    }
}

//display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(element => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${element.image} alt="product-${element.id}" class="product-img">
                    <button class="bag-btn" data-id=${element.id}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="shopping-cart" viewBox="0 0 576 512">
                            <path
                                d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                        </svg>
                        <p>
                            Add to Bag
                        </p>
                    </button>
                </div>
                <h3>${element.title}</h3>
                <h4>₹${element.price}</h4>
            </article>
            `;
        });
        productDOM.innerHTML = result;
    }
    getBagButtons() {
        //why not replace button with buttonDOm
        const buttons = [...document.querySelectorAll(".bag-btn")];
        // console.log(buttons);
        buttonDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => { return item.id === id })
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (e) => {
                // e.target.innerText = "In Cart";
                button.innerText = "In Cart";
                button.disabled = true;
                //get product from products
                let cartItem = { ...Storage.getProduct(id), quantity: 1 };
                //add product to the cart
                cart.push(cartItem);
                // console.log(cart);
                // cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveDataToLocalStorage("cart", cart);
                //set cart values
                this.setCartValues(cart);
                //dispaly cart item
                this.addCartItem(cartItem)
                //show the cart
                this.showCart();
            });
            // console.log(id);
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.quantity;
            itemsTotal += item.quantity;
        });
        // console.log(cart);
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(cartItem) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.setAttribute('id', `${cartItem.id}`);
        div.innerHTML = `
        <img src = ${cartItem.image} alt = "product-${cartItem.id}" >
            <div>
                <h4>${cartItem.title} </h4>
                <h5>₹${cartItem.price}</h5>
                <span class="remove-item" data-id=${cartItem.id}>Remove</span>
            </div >
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="chevron-up increase-quanity" data-id=${cartItem.id}>
                    <path class="increase-quanity"
                        d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
                </svg>
                <p class="item-amount">${cartItem.quantity}</p>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="chevron-down decrease-quanity" data-id=${cartItem.id}>
                    <path class="decrease-quanity"
                        d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                </svg>
            </div>`;
        cartContent.appendChild(div);
        // console.log(cartContent);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        });
        //cart functionality
        cartContent.addEventListener('click', e => {
            if (e.target.classList.contains("remove-item")) {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            }
            else if (e.target.classList.contains("increase-quanity")) {
                let addQuantity = e.target;
                if (!addQuantity.classList.contains('chevron-up')) {
                    addQuantity = addQuantity.parentElement;
                }
                let id = addQuantity.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.quantity++;
                Storage.saveDataToLocalStorage('cart', cart);
                this.setCartValues(cart);
                addQuantity.nextElementSibling.innerText = tempItem.quantity;
            }
            else if (e.target.classList.contains("decrease-quanity")) {
                let lowerQuantity = e.target;
                if (!lowerQuantity.classList.contains('chevron-down')) {
                    lowerQuantity = lowerQuantity.parentElement;
                }
                let id = lowerQuantity.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.quantity--;
                if (tempItem.quantity > 0) {
                    Storage.saveDataToLocalStorage('cart', cart);
                    this.setCartValues(cart);
                    lowerQuantity.previousElementSibling.innerText = tempItem.quantity;
                }
                else {
                    cartContent.removeChild(lowerQuantity.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        // while (cartContent.children.length > 0) {
        //     cartContent.removeChild(cartContent.children[0])
        // }
        cartContent.innerHTML = '';
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveDataToLocalStorage('cart', cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="shopping-cart" viewBox="0 0 576 512">
                            <path
                                d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                        </svg>
                        <p>
                            Add to Bag
                        </p>`;
        // this.populateCart(cart);
    }
    getSingleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id);
    }
}

//local Storage
class Storage {
    static saveDataToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}
document.addEventListener("DOMContentLoaded", () => {

    const ui = new UI();
    const products = new Products();

    //Setup Application
    ui.setupAPP()

    //get all products
    //load all products from local storage if they exist there
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveDataToLocalStorage("products", products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
    // client.getEntry().then(entry => console.log(entry)).catch(err => console.log(err));
});