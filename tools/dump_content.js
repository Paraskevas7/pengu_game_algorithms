// Prints lesson titles and goals (en and el) as JSON for the workbook builder.
global.window = global;
const I18n = require('../www/js/i18n.js'); global.I18n = I18n;
require('../www/js/i18n-el.js');
const Content = require('../www/js/content.js'); global.Content = Content;
require('../www/js/content-el.js');
const out = {};
for (const lang of ['en', 'el']) {
  I18n.setLang(lang);
  out[lang] = {};
  Content.order.forEach((k) => { out[lang][k] = { title: Content[k].title, goal: Content[k].goal }; });
}
console.log(JSON.stringify(out));
