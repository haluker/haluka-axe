const fs = require('fs')
const pluralize = require('pluralize')

module.exports = function (opts, resource = false) {

    let pluralWord = pluralize(opts.name.toLowerCase())
let cont = 
`
const { Controller } = require("@haluka/routing")
` + (resource ? `const ${opts.name} = require('../Model/${opts.name}').default
const ModelBinding = use('ModelBinding')` : '') + `

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
        let ${pluralWord} = await ${opts.name}.find()
        res.json(${pluralWord}.lean())
    }

    /**
     * @route GET /${pluralWord}/{identifier}
     * @desc Fetches ${opts.name} with provided identifier
     */
    async view ({ req, res, next }) {
        let binder = await ModelBinding.withRoute(req, ${opts.name})
        res.json(binder.get())
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
    async post ({ req, res, next }) {
        let binder = ModelBinding.withForm(req, ${opts.name})
        let validationErrors = binder.validate()
        
        await binder.save()
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
    async update ({ req, res, next }) {
        let binder = await ModelBinding.withRoute(req, ${opts.name})

        await binder.update()

    }

    /**
     * @route [POST/DELETE] /${pluralWord}/{identifier}/delete
     * @desc Deletes ${opts.name} 
     */
    async delete ({ req, res, next }) {
        let binder = await ModelBinding.withRoute(req, ${opts.name})

        await binder.delete()
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