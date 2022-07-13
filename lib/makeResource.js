const fs = require('fs')
const pluralize = require('pluralize')

const controller = require('./makeController')
const model = require('./makeModel')

module.exports = function (opts) {

    model(opts)
    controller(opts, true)

    // add Route
    if (!fs.existsSync(app().routesPath())) {
        console.log('Routes Path doesn\'t exist. Creating...')
        fs.mkdirSync(app().routesPath())
    }

    let fname = app().routesPath('resource.js')
    let data = ''
    if (fs.existsSync(fname))
        data += fs.readFileSync(fname)
    else {
        data +=
`
let Route = exports.Route = use('Router')

/**
 * @name ResourceRoutes
 * @desc Houses the routes for the resources of the application
 */

`
    }

    data +=
`
// ${opts.name} Resource Route
Route.group({
    prefix: '/${pluralize(opts.name.toLowerCase())}'
}, () => {
    Route.get('/', '${opts.name}.all')
    Route.get('/new', '${opts.name}.create')
    Route.post('/new', '${opts.name}.post')
    Route.get('/:identifier', '${opts.name}.view')
    Route.get('/:identifier/edit', '${opts.name}.edit')
    Route.route(['POST', 'PUT', 'PATCH'], '/:identifier/edit', '${opts.name}.update')
    Route.route(['POST', 'DELETE'], '/:identifier/delete', '${opts.name}.delete')
})


`
fs.writeFileSync(fname, data)
}