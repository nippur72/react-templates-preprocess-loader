import _ = require("lodash");
import url = require("url");
import queryString = require("querystring");
import cheerio = require("cheerio");

type visitFunction = ((node: CheerioElement) => void) | undefined;

interface IVisiter {
   onTag: visitFunction;
   onStyle: visitFunction;
   onText: visitFunction;
   onComment: visitFunction;
   context: {};
}

export let visiter: IVisiter = {
   onTag: undefined,
   onStyle: undefined,
   onText: undefined,
   onComment: undefined,
   context: {}
};

export function loader(source: string): string {
   const query = queryString.parse(url.parse(this.query).query);
   this.cacheable && this.cacheable();
   return process(source);
};

function process(source: string) {
   const cheerioOptions = {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true}; // xmlMode turned off to allow decode of &nbsp; 
   const rootNode = cheerio.load(source, cheerioOptions); 
   const rootTags = _.filter(rootNode.root()[0].children, node => node.type === "tag" || node.type === "style");
   const root = rootTags[0] as CheerioElement;

   visit(root);

   return rootNode.root().html();
}

function visit(node: CheerioElement): void {
        if (node.type === "tag")     visitTagNode(node);
   else if (node.type === "style")   visitStyleNode(node);
   else if (node.type === "comment") visitCommentNode(node);
   else if (node.type === "text")    visitTextNode(node);
}

function visitTagNode(node: CheerioElement): void {
   if (visiter.onTag) {
      visiter.onTag(node);
   }
}

function visitStyleNode(node: CheerioElement): void {
   if (visiter.onStyle) {
      visiter.onStyle(node);
   }
}

function visitCommentNode(node: CheerioElement): void {
   if (visiter.onComment) {
      visiter.onComment(node);
   }
}

function visitTextNode(node: CheerioElement): void {
   if (visiter.onText) {
      visiter.onText(node);
   }
}
