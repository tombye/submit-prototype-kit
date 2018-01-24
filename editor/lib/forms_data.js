const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(process.cwd(), '../examples');  
const encoding = 'utf8';
const dataFiles = [];
const forms = [];


class FormComponent {
  constructor(data, form) {
    this.data = data;
    this.form = form;
  }
  save() {
    this.form.save();
  }
}


class Field extends FormComponent {
  get field() { return this.data.field || undefined; }
  get inputtype() { return this.data.inputtype || undefined; }
  get items() { return this.data.items || undefined; }
}


class Page extends FormComponent {
  get page() { return (this.data.page === 'index') ? '' : this.data.page; }
  get pagetype() { return this.data.pagetype; }
  get heading() { return this.data.heading || undefined; }
  get guidance() { return this.data.guidance || undefined; }
  get detail() { return this.data.detail || undefined; }
  get fields() {
    let form = this.form;

    if (this.data.hasOwnProperty('fields')) {
      return this.data.fields.map(f => {
        let field = new Field(f, form);

        return field;
      });
    }

    return undefined;
  }
  get next() { return this.data.next || undefined; }
}


class Organisation extends FormComponent {
  get name() { return this.data.name; }
  get organisation() { return this.data.organisation; }
  get website() { return this.data.website; }
}


class Form {
  constructor(data, fileName) {
    this.data = data;
    this.fileName = fileName;
  }
  get name() { return this.data.name; }
  get heading() { return this.data.heading; }
  get phase() { return this.data.phase; }
  get pages() {
    let form = this;

    return this.data.pages.map(p => {
      var page = new Page(p, form);
      
      return page;
    });
  }
  get organisations() {
    let form = this;

    return this.data.organisations.map(o => {
      let org = new Organisation(o, form);

      return org;
    });
  }
  save() {
    let dataStr = JSON.serialize(this.data);

    fs.writeFileSync(this.fileName, dataStr, { "encoding": encoding })
  }
}


const formsData = {
  init: function() {
    let jsonFile = RegExp('.+\.json$');

    // get files
    fs.readdirSync(dataDir).forEach(file => dataFiles.push(file));

    // load data
    dataFiles.forEach(file => {
      if (!jsonFile.test(file)) { return; }

      let fileName = path.resolve(dataDir, file);
      let data = JSON.parse(fs.readFileSync(fileName, encoding));

      forms.push(new Form(data, fileName));
    })
  },
  getForm: function(formName) {
    let matches = forms.filter(form => { return form.name === formName });

    return matches.length ? matches[0] : null;
  },
  getAll: function() {
    return forms;
  }
}


module.exports = formsData;
