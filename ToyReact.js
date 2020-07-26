export class Component {
    constructor() {
        this.children = [];
        this.props = Object.create(null);
    }

    setAttribute(name, value) {
        this.props[name] = value;
        this[name] = value;
    }

    mountTo(range) {
        this.range = range;
        this.update();
        // let range =document.createRange();
        // range.setStartAfter(parent.lastChild);
        // range.setEndAfter(parent.lastChild);
    }

    update() {
        let placeholder = document.createComment("placeholder");
        let range = document.createRange();
        range.setStart(this.range.endContainer, this.range.endOffset);
        range.setEnd(this.range.endContainer, this.range.endOffset);
        range.insertNode(placeholder);

        this.range.deleteContents();
        let vdom = this.render();
        vdom.mountTo(this.range);

        // placeholder.parentNode.removeChild(placeholder);
    }

    appendChild(vChild) {
        this.children.push(vChild);
    }

    setState(state) {
        let merge = (oldState, newState) => {
            for (let newStateKey in newState) {
                if (typeof newState[newStateKey] === "object") {
                    if (typeof oldState[newStateKey] !== "object") {
                        oldState[newStateKey] = {}
                    }
                    merge(oldState[newStateKey], newState[newStateKey]);
                } else {
                    oldState[newStateKey] = newState[newStateKey];
                }
            }
        };

        if (!this.state && state) {
            this.state = {};
        }

        merge(this.state, state);
        console.log(this.state);
        this.update();
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        super();
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLocaleLowerCase());
            this.root.addEventListener(eventName, value);
        }
        if (name === "className") {
            name = "class";
        }
        this.root.setAttribute(name, value);
    }

    appendChild(vChild) {
        let range = document.createRange();
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild);
            range.setEndAfter(this.root.lastChild);
        } else {
            range.setStart(this.root, 0);
            range.setEnd(this.root, 0);
        }
        vChild.mountTo(range);
    }

    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.root);
    }
}

class TextWrapper extends Component {
    constructor(textContent) {
        super();
        this.root = document.createTextNode(textContent);
    }

    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.root);
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
                    if (child instanceof Component === false) {
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
        let range = document.createRange();
        if (element.children.length) {
            range.setStartAfter(element.lastChild);
            range.setEndAfter(element.lastChild);
        } else {
            range.setStart(element, 0);
            range.setEnd(element, 0);
        }
        vdom.mountTo(range);
    }
}