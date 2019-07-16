module.exports = {
    ifeq(a, b, options){
        if (a == b ){
            console.log('true')
            return options.fn(this)
        }
        console.log('false')
        return options.inverse(this)
        
    }
}