const instance = M.Tabs.init(document.querySelectorAll('.tabs'));

const toCurrency = price => {
    return new Intl.NumberFormat( 'ua-UA', {
        currency: 'uah',
        style: 'currency'
    }).format(price)
}
const toDate = date => {
    return new Intl.DateTimeFormat( 'ua-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})
document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

const $cart = document.querySelector('#cart')
if($cart){
    $cart.addEventListener('click', event => {
        if(event.target.classList.contains('js-remove')){
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            console.log(id)

            fetch('/cart/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
                .then(cart => {
                    if(cart.courses.length){
                        const html = cart.courses.map(c => {
                            return `
                            <tr>
                            <td>${c.title}</td>
                            <td>${c.count}</td>
                            <td>
                                <button class="btn btn-small js-remove" data-id="${c.id}">Delete</button>
                            </td>
                        </tr>
                            `
                        }).join('')

                        $cart.querySelector('tbody').innerHTML = html
                        $cart.querySelector('.price').textContent = toCurrency(cart.price)
                    }else{
                        $cart.innerHTML= '<p>Cart is empty!</p>'
                    }
                })
            
        }
    })
}
