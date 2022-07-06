process.env.NODE_ENV = 'cli'

const fs = require('fs')
const ignite = require('haluka-ignite').Ignite
const dotenv = require('dotenv')
const randomstring = require('randomstring')

exports.preHooks = async () => {
    process.env.ENV_PATH = '.env'

    let _default = {
        prettyBoot: false,
        bootMessage: false,
        useRecommended: false,
        httpConfig: 'haluka:config',
    }
    let localOpts = fs.existsSync('ignite.config.js') ? require(process.cwd() + '/ignite.config.js') : {}
    let opts = Object.assign(_default, localOpts)
    await ignite(opts)
}
exports.assets = ({ params }) => {
    require('haluka-sass').default({
        source: './resources/scss',
        dest: './public/css',
        minify: params.includes('--minify') ? true : false,
        suffix: params.includes('--minify') ? '.min' : '',
    })
}
exports['create-env'] = async ({ prompt }) => {
    if (fs.existsSync('.env')) {
        return console.log('.env file already exists. Skipping.')
    }
    if (fs.existsSync('.env.example')) {
        console.log('creating env from existing example file...')
        const config = dotenv.parse(Buffer.from(fs.readFileSync('.env.example')))
        delete config['APP_KEY']

        let questions = Object.keys(config).map(x => { return { name: x, default: config[x] } })
        try {
            let answers = await prompt(questions)
            answers['APP_KEY'] = randomstring.generate(64)
            let envData = Object.keys(answers).map(x => x + '=' + answers[x]).join('\n')
            fs.writeFileSync('.env', envData)
        } catch (error) {
            if (error.isTtyError) {
                console.log('Cannot run prompt in the current environment.')
            } else {
              console.log('Unknown Error: '+ error)
            }
        }
    }
}
exports.make = async ({ prompt }) => {
    try {
        let answers = await prompt([{
                type: 'list',
                name: 'type',
                message: 'Select a file to make',
                choices: ['Controller', 'Model', 'Resource']
            },
            {
                name: 'name',
                message: 'Name',
				validate: (ans) => {
					// return fs.existsSync()
					return true
				}
            }
        ])
        
        let method = require(`./lib/make${answers.type}`)
		await method(answers)
    } catch (error) {
        if (error.isTtyError) {
            console.log('Cannot run prompt in the current environment.')
        } else {
          console.log('Unknown Error: '+ error)
        }
    }
    
}