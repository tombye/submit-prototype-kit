#! /usr/bin/env node

// command to compile a prototype GOV.UK submit form

var fs = require('fs')
var path = require('path')
var nunjucks = require('nunjucks')
var markdown = require('nunjucks-markdown');
var marked = require('marked');
var mkdirp = require('mkdirp')
var chalk = require('chalk')
var glob = require("glob")
var yargs = require('yargs')


// Check if node_modules folder exists
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), '/node_modules'))
if (!nodeModulesExists) {
  console.error('ERROR: Node module folder missing. Try running `npm install`')
  process.exit(0)
}

// command line
var argv = yargs
  .usage('Usage: submit form.json')
  .example('submit examples/simple.json', 'compile example simple form')
  .demand(1)
  .option('templates', {
    alias: 't',
    string: true,
    requiresArg: true,
    nargs: 1,
    describe: 'Directory where templates live'
  })
  .option('out', {
    alias: 'o',
    string: true,
    requiresArg: true,
    nargs: 1,
    describe: 'Output directory'
  })
  .help()
  .alias('help', 'h')
  .epilogue('For more information see https://github.com/alphagov/submit-prototype-kit')
  .argv


var opts = {}
opts.templatesDir = argv.templates || './templates'
opts.outputDir = argv.out || './prototype/app/views/'

var templates = nunjucks.configure(path.resolve(process.cwd(), opts.templatesDir), {})

markdown.register(templates, marked);

function renderPage(page, form) {

  var templateFile = path.resolve(opts.templatesDir, page.pagetype + '.html')
  var outputFile = path.resolve(opts.outputDir, page.name.replace(/\W/, '-') + '.html')

  data = {
    form: form,
    page: page,
    templateFile: templateFile,
    outputFile: outputFile
  }

  templates.render(templateFile, data, function(err, output) {

    if (err) {
      return console.error(chalk.red(err))
    }

    console.log(chalk.blue('Writing: ' + outputFile))
    mkdirp.sync(path.dirname(outputFile))
    fs.writeFileSync(outputFile, output)
  })
}


function renderForm(form) {
  for (let page of form.pages) {
    renderPage(page, form, opts.outputDir)
  }
}


function pageName(form, i) {
    if ((i < 0) || (i >= form.pages.length)) {
      return undefined
    }
    page = form.pages[i]
    return page.name || "page" + i
}


function loadForm(path) {
  console.log(chalk.blue('Loading ' + path))
  var form = JSON.parse(fs.readFileSync(path, 'utf8'))

  for (var i = 0; i < form.pages.length; i++) {
    form.pages[i].name = pageName(form, i)
    form.pages[i].back = pageName(form, i-1)
    form.pages[i].next = pageName(form, i+1)
  }

  return form
}


renderForm(loadForm(argv._[0]))