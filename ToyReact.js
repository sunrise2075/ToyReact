export class Component {
    constructor() {
        this.children = [];
    }

    setAttribute(name, value) {
        this[name] = value;
    }

    mountTo(parent) {
        let vdom = this.render();
        vdom.mountTo(parent);
    }

    appendChild(vChild) {
        this.children.push(vChild);
    }
}

class ElementWrapper extends Component{
    constructor(type) {
        super();
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value);
    }

    appendChild(vChild) {
        vChild.mountTo(this.root);
    }

    mountTo(parent) {
        parent.appendChild(this.root);
    }
}

class TextWrapper extends Component{
    constructor(textContent) {
        super();
        this.root = document.createTextNode(textContent);
    }

    mountTo(parent) {
        parent.appendChild(this.root);
    }
}




export let ToyReact = {
    createElement(type, attributes, ...children) {

        let element;
        if (typeof type === "string") {
            element = new ElementWrapper(type);
        } else {
            element = new type;
        }
        for (let attrName in attributes) {
            element.setAttribute(attrName, attributes[attrName]);
        }

        let insertChildren = (children) => {
            for (let child of children) {
                if (typeof child === "object" && child instanceof Array) {
                    insertChildren(child);
                } else {
                    if (!children instanceof Component){
                        child = String(child);
                    }
                    if (typeof child === 'string') {
                        child = new TextWrapper(child);
                    }
                    element.appendChild(child);
                }
            }
        }
        insertChildren(children);
        return element
    },

    render(vdom, element) {
        vdom.mountTo(element);
    }
}