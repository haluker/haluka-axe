const fs = require('fs')
const pluralize = require('pluralize')

module.exports = function (opts, resource = false) {

    let singularWord = opts.name.toLowerCase()
    let pluralWord = pluralize(singularWord)
let cont = 
`
const { Controller } = require("@haluka/routing")
` + (resource ? `const ${opts.name} = require('../Model/${opts.name}').default
const ModelBinding = use('ModelBinding')` : '') + `
const createError = require('http-errors')

class ${opts.name}Controller extends Controller {

    middlewares = [
        // middleware here
    ]
` + (resource == false ? 
`    async index ({ req, res, next }) {
        res.send('Hi, from ${opts.name} controller!')
    }
` : 
`   
    /**
     * @route GET /${pluralWord}
     * @desc Fetches all ${opts.name}
     */
    async all ({ req, res, next }) {
        let ${pluralWord} = await ${opts.name}.find().lean()
        res.status(200).json({ status: "success", data: ${pluralWord} })
    }

    /**
     * @route GET /${pluralWord}/{identifier}
     * @desc Fetches ${opts.name} with provided identifier
     */
    async view (ctx) {
        let binding = await ModelBinding.withRoute(ctx, ${opts.name})
        binding.handleResponse()
    }

    /**
     * @route GET /${pluralWord}/new
     * @desc Responds with a new ${opts.name} form
     */
    async create ({ req, res, next }) {
        res.render('path.to.form', {})
    }

    /**
     * @route POST /${pluralWord}/new
     * @desc Creates ${opts.name} from request
     */
    async post (ctx) {
        let binding = await ModelBinding.withForm(ctx, ${opts.name})
        if (await binding.validate() === false) {
            // what if invalidated
        }
        /**
         * Use the \`setField\` method on binding to set a custom value to the field
         * binding.setField('fieldName', (autoValue, postValue) => {
         *  // return the value to be set
         * })
         */
        
        await binding.saveDocument()
    }

    /**
     * @route GET /${pluralWord}/{identifier}/edit
     * @desc Responds with the ${opts.name} form to edit
     */
    async edit ({ req, res, next }) {
        res.render('path.to.form', {})
    }

    /**
     * @route [POST/PUT/PATCH] /${pluralWord}/{identifier}/edit
     * @desc Updates ${opts.name} with provided identifier from request
     */
    async update (ctx) {
        let binding = await ModelBinding.withRoute(ctx, ${opts.name})
        await binding.updateDocument({
            // fieldName: newValue [TODO]
        })
    }

    /**
     * @route [POST/DELETE] /${pluralWord}/{identifier}/delete
     * @desc Deletes ${opts.name} 
     */
    async delete (ctx) {
        let binding = await ModelBinding.withRoute(ctx, ${opts.name})
        await binding.deleteDocument()
    }
`) + 
`
}

exports.default = ${opts.name}Controller
`

if (!fs.existsSync(app().controllersPath())) {
    console.log('Controllers Path doesn\'t exist. Creating...')
    fs.mkdirSync(app().controllersPath())
}

if (fs.existsSync(app().controllersPath(opts.name + '.js'))) {
    return console.log(`Controller '${opts.name}' already exists in Controllers path. Skipping...`)
}

fs.writeFileSync(app().controllersPath(opts.name + '.js'), cont)

}