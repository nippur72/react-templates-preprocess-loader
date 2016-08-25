import _ = require("lodash");
import url = require("url");
import queryString = require("querystring");
import cheerio = require("cheerio");

import { getNodeLoc } from "./location";

interface IVisiter {
   onBeforeVisit?: (node: CheerioElement) => void;
   onAfterVisit?: (node: CheerioElement) => void;
   onBeforeTag?: (node: CheerioElement) => void;
   onAfterTag?: (node: CheerioElement) => void;
   onStyle?: (node: CheerioElement) => void;
   onText?: (node: CheerioElement) => void;
   onComment?: (node: CheerioElement) => void;
   context: {
      html: string,
      currentNode: CheerioElement | null
   };
}

export let visiter: IVisiter = {
   context: {
      html: "",
      currentNode: null
   }
};

export function loader(source: string, map: any) {
   const query = queryString.parse(url.parse(this.query).query);
   this.cacheable && this.cacheable();
   try {
      source = process(source);
   } catch (err) {
      let message = (typeof err === "string") ? err : err.message;
      if (visiter.context.currentNode) {
         const { pos } = getNodeLoc(visiter.context, visiter.context.currentNode);
         message += ` in line ${pos.line}, col ${pos.col}`;
      }
      this.callback(new Error(message));
      return;
   }
   this.callback(null, source, map);
};

function process(source: string) {
   const cheerioOptions = {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true}; // xmlMode turned off to allow decode of &nbsp; 
   const rootNode = cheerio.load(source, cheerioOptions); 
   const rootTags = _.filter(rootNode.root()[0].children, node => node.type === "tag" || node.type === "style");
   const root = rootTags[0] as CheerioElement;

   visiter.context.html = rootNode.root().html();
   visiter.context.currentNode = root;

   if (visiter.onBeforeVisit) {
      visiter.onBeforeVisit(root);
   }

   visit(root);

   if (visiter.onAfterVisit) {
      visiter.onAfterVisit(root);
   }

   return rootNode.root().html();
}

function visit(node: CheerioElement): void {
        if (node.type === "tag")     visitTagNode(node);
   else if (node.type === "style")   visitStyleNode(node);
   else if (node.type === "comment") visitCommentNode(node);
   else if (node.type === "text")    visitTextNode(node);
}

function visitTagNode(node: CheerioElement): void {
   visiter.context.currentNode = node;

   if (visiter.onBeforeTag) {
      visiter.onBeforeTag(node);
   }

   _.each(node.children, child => visit(child));

   if (visiter.onAfterTag) {
      visiter.onAfterTag(node);
   }
}

function visitStyleNode(node: CheerioElement): void {
   visiter.context.currentNode = node;

   if (visiter.onStyle) {
      visiter.onStyle(node);
   }
}

function visitCommentNode(node: CheerioElement): void {
   visiter.context.currentNode = node;

   if (visiter.onComment) {
      visiter.onComment(node);
   }
}

function visitTextNode(node: CheerioElement): void {
   visiter.context.currentNode = node;

   if (visiter.onText) {
      visiter.onText(node);
   }
}
