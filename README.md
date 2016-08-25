# react-templates-preprocess-loader

Webpack loader that preprocesses `react-templates` templates.

Uses a configurable tree visiter you can customize as follows:
```ts
interface IVisiter {
   onBeforeVisit?: (node: CheerioElement) => void;
   onAfterVisit?: (node: CheerioElement) => void;
   onBeforeTag?: (node: CheerioElement) => void;
   onAfterTag?: (node: CheerioElement) => void;
   onStyle?: (node: CheerioElement) => void;
   onText?: (node: CheerioElement) => void;
   onComment?: (node: CheerioElement) => void;
   context: {};
}
```

Example of use:
`./my-loader.js`:
```js
const { visiter, loader } = require("react-templates-preprocess-loader");

visiter.onBeforeTag = node => {
   if (node.name === 'img') {
      if (node.attribs["rt-src"]) {
         let val = node.attribs["rt-src"];
         val = `{require('${val}')}`;
         node.attribs["src"] = val;
         delete node.attribs["rt-src"];   
      }
   }
};

module.exports = loader;
```

in `webpack.config.js`:
```js
// ...
loaders = [{ test: /\.rt$/, loaders: [ "react-templates-loader", `${__dirname}/my-loader`] }];
// ...
```
