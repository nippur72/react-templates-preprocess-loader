# react-templates-preprocess-loader

[react-templates](https://github.com/wix/react-templates) pre-processor 
that works as a [Webpack](https://webpack.github.io/) loader.

This utility lets you easily setup a custom webpack loader that:

- loads a `.rt` file
- gives you access to the DOM-tree from JavaScript
- feeds the modified DOM to `react-templates`

By hacking the DOM-tree you can implement custom features 
that you don't find in `react-templates`.

## Install

Install in your webpack build directory with: 
```
npm install react-templates-preprocess-loader --save-dev
```

## Usage

1. import `{ visiter, loader }` from the package
2. customize `visiter` to your needs
3. export `loader` to webpack.

The `visiter` has the following interface you can modify:

```ts
interface IVisiter {
   onBeforeVisit?: (node: CheerioElement) => void;  // before visiting the whole file
   onAfterVisit?: (node: CheerioElement) => void;   // after visited the whole file
   onBeforeTag?: (node: CheerioElement) => void;    // visting a <tag>, before visiting its children
   onAfterTag?: (node: CheerioElement) => void;     // visting a <tag>, after visiting its children
   onStyle?: (node: CheerioElement) => void;        // visting a <style> node
   onText?: (node: CheerioElement) => void;         // visting a text node, node.data holds the text string
   onComment?: (node: CheerioElement) => void;      // visting a <!-- comment --> node
   context: {};
}
```
The `node` arguments are nodes from [`cheerio`](https://github.com/cheeriojs/cheerio).

In each `on` event function, modify the nodes or `throw` an error to halt Webpack bundling.

`context` is a generic object you can use to share data betewen different calls of the event functions.

## Example

In the following example, the preprocessor is used to turn 
```html
<img rt-src="someresource"/>
```
into
```html
<img src="{require('someresource')}"/>
```

Write a `./my-loader.js` file as follows:
```js
const { visiter, loader } = require("react-templates-preprocess-loader");

visiter.onBeforeTag = node => {   
   if (node.name === 'img') {
      if (node.attribs["rt-src"]) {
         if(node.attribs["src"]) {            
            throw "can't have both 'src' and 'rt-src' attributes specified on <img>";
         }
         let val = node.attribs["rt-src"];
         val = `{require('${val}')}`;
         node.attribs["src"] = val;
         delete node.attribs["rt-src"];   
      }
   }   
};

module.exports = loader;
```

Last step is to add the newly created loader into webpack chain of loaders, just before `react-templates-loader`:

In `webpack.config.js`:
```js
// ...
loaders = [{ test: /\.rt$/, loaders: [ "react-templates-loader", `${__dirname}/my-loader`] }];
// ...
```

Note: `${__dirname}/` is not necessary if `my-loader` is written as a module under `node_modules/`.

## License

MIT

