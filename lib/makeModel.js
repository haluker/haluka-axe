const fs = require('fs')
const inquirer = require('inquirer')
const _ = require('lodash')

module.exports = async function (opts) {

console.log('Running Schema Builder...')

let tablvl = 1
let ask = async () => { 
    let answers = await inquirer
    .prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Name of field',
        },
        {
            type: 'confirm',
            name: 'subdata',
            message: 'Has sub-fields'
        }, 
        {
            type: 'list',
            name: 'type',
            message: 'Type of field',
            choices: ['String', 'Number', 'Date', 'Buffer', 'Boolean', 'Array', 'Map', 'Decimal128', 'ObjectId', 'Schema', 'Mixed'],
            when: (ans) => {
                return ans.subdata == false
            }
        },
        {
            type: 'confirm',
            name: 'unique',
            message: 'Is Unique Value',
            when: (ans) => {
                return ans.subdata == false
            }
        },
        {
            type: 'confirm',
            name: 'required',
            message: 'Is Required Value',
            when: (ans) => {
                return ans.subdata == false
            }
        },
        {
            type: 'confirm',
            name: 'addmore',
            message: 'Add more fields?',
            when: (ans) => {
                return ans.subdata == false
            }
        }
    ])
    let schemaData = 
    `${genTab(tablvl)}${answers.name}: {\n`
    if (!answers.subdata) {
        let fieldProps = _.omit(answers, ['name', 'subdata', 'addmore'])
        tablvl++
        for (let prop in fieldProps) {
            schemaData += 
            `${genTab(tablvl)}${prop}: ${fieldProps[prop]},\n`
        }
        tablvl--
        schemaData += 
        `${genTab(tablvl)}},\n`
        if (answers.addmore) {
            console.log('Next field...')
            schemaData += await ask()
        }
        console.log('Completed field "' + answers.name + '"')
    }else {
        console.log('Starting Sub-fields for "' + answers.name + '"')
        tablvl++
        schemaData += await ask()
        tablvl--
        schemaData += 
    `${genTab(tablvl)}}\n`
    }
    
    return schemaData

}

let schemaData = '// add fields here' //await ask()

let schema = 
`
const { Schema } = require('mongoose')
const { ObjectId, Decimal128, Map, Mixed, Schema } = require('mongoose').Types

const ${opts.name}Schema = new Schema({

${schemaData}

})

exports.default = ${opts.name}Schema`

let model = 
`
const Schema = require('../Schema/${opts.name}').default
const Model = use('Database').default().model('${opts.name}', Schema)

exports.default = class ${opts.name} extends Model {
    
    // ${opts.name} methods here

}

`

// Create Directories
if (!fs.existsSync(app().appPath('Schema'))) {
    console.log('Schema Path doesn\'t exist. Creating...')
    fs.mkdirSync(app().appPath('Schema'))
}
if (!fs.existsSync(app().modelPath())) {
    console.log('Model Path doesn\'t exist. Creating...')
    fs.mkdirSync(app().modelPath())
}

if (fs.existsSync(app().appPath('Schema', opts.name + '.js'))) {
    return console.log(`Schema '${opts.name}' already exists in Schema path. Skipping...`)
}
if (fs.existsSync(app().modelPath(opts.name + '.js'))) {
    return console.log(`Model '${opts.name}' already exists in Model path. Skipping...`)
}

fs.writeFileSync(app().appPath('Schema', opts.name + '.js'), schema)
fs.writeFileSync(app().modelPath (opts.name + '.js'), model)

}

let genTab = (num) => '\t'.repeat(num)