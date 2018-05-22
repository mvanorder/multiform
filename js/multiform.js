/*
 *
 * MultiForm 0.3 - Replicate a set of fields in a form for a one-to-many form.
 * Version 0.3b
 * @requires jQuery v1.4.3
 *
 * Copyright (c) 2017 Malcolm VanOrder
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

var FORM_ELEMENTS = ["DATALIST", "INPUT", "OPTGROUP", "SELECT", "TEXTAREA"];

/**
 * Clone nodes and add a prefix to ids, names, and for attributes on fields and labels.
 * @param {object} nodes - A nodes list of array of nodes to be cloned.
 * @param {string} prefix - The prefix to be added to the ids, names, and for attributes.
 */
function cloneFormNodes(nodes, prefix) {
  var newNodes = new Array();

  for (var i = 0; i < nodes.length; i++) {
    // Ignore all #text, #comment and #document nodes as they thrown an illegal character error in
    // createElement().
    if (!nodes[i].nodeName.includes('#')) {
      // Use createElement to create clones for all except #text nodes to avoid modifying the original.
      newNodes[i] = document.createElement(nodes[i].nodeName);

      // Copy all attributes from the original node to the new node
      for (var attrIndex = 0, attrSize = nodes[i].attributes.length; attrIndex < attrSize; attrIndex++) {
        newNodes[i].setAttribute(nodes[i].attributes[attrIndex].name, nodes[i].attributes[attrIndex].value);
      }

      if (FORM_ELEMENTS.includes(nodes[i].nodeName)) {
        // Prefix ids and names on fields.
        newNodes[i].name = prefix + nodes[i].name;
        newNodes[i].id = prefix + nodes[i].id;
      } else if (nodes[i].nodeName == "LABEL") {
        // Prefix for attributes on labels.
        newNodes[i].setAttribute('for', prefix + nodes[i].getAttribute('for'));
      } else {
        // If an element doesn't fall into either of the above statements then only apply the prefix if an is or name
        // exists.
        if (nodes[i].id) {
          newNodes[i].id = prefix + nodes[i].id;
        }
        if (nodes[i].name) {
          newNodes[i].name = prefix + nodes[i].name;
        }
      }
    } else {
      // Clone any simple #text nodes.
      newNodes[i] = nodes[i].cloneNode(true)
    }

    // If the current node has children, process them as well.
    if (nodes[i].childNodes.length > 0) {
      var newChildNodes = cloneFormNodes(nodes[i].childNodes, prefix);
      for (var childNodeIndex = 0, size = newChildNodes.length; childNodeIndex < size ; childNodeIndex++) {
        newNodes[i].appendChild(newChildNodes[childNodeIndex])
      }
    }
  }
  return newNodes;
}

class Template {

  /**
   * Represents a template instance of the form to be replicated.
   * @constructor
   * @param {object} baseObject - The DOM object containing the form objects to
   * be templated.
   * @param {string} prefix - The prefix to set on all field names.
   */
  constructor(args) {
    let baseObject = args.baseObject;
    this.nodes = new Array();
    this.prefix = args.prefix;
    this.currentIteration = args.iteration || 0;
    this.classList = [];
    this.removeButton = args.removeButton || undefined;
    this.removeButtonContainer = args.removeButtonContainer || undefined;

    // Build a list of classes to be used on instanaces of the template.
    for (let i = 0; i < baseObject.classList.length; i++) {
      this.classList.push(baseObject.classList[i]);
    }

    // Create a template list of nodes from the nodes in the baseObject and
    // remove the original nodes.
    Array.from(baseObject.childNodes).forEach(
      (node, nodeIndex, listObj) => {
        this.nodes.push(node.cloneNode(true));
        baseObject.removeChild(node);
      },
      this
    );
  }

  instance() {
    let instanceContainer = document.createElement('div');
    let removeButton = this.removeButton || document.createElement('div');
    let instance_prefix = this.prefix + "_" + this.currentIteration.toString() + "-"
    let nodes = cloneFormNodes(this.nodes, instance_prefix);

    // Add each class from the template to the new instance.
    for (let classIndex in this.classList) {
      instanceContainer.classList.add(this.classList[classIndex]);
    }

    // Create a button to remove this instance.
    if (this.removeButton) {
      removeButton = this.removeButton.cloneNode(true);
    } else {
      removeButton.innerHTML = 'Remove';
    }

    // Set the removeButton's type only if it's not already set.
    if (!removeButton.getAttribute('type')) {
      removeButton.setAttribute('type', 'button');
    }

    // Add additional classes
    removeButton.classList.add('btn');
    if ($(removeButton).filter("*[class^='btn-']").length == 0) {
        removeButton.classList.add('btn-danger');
    }
    removeButton.classList.add('multiform-remove');

    // Set the item container ID and the remove button data to point to it.
    instanceContainer.id = instance_prefix + 'item_container';
    removeButton.setAttribute('data-itemcontainer', instanceContainer.id);

    // Create a set of nodes and populate the new container.
    for(var node in nodes) {
      instanceContainer.appendChild(nodes[node]);
    }

    // Append the remove button last.
    if (this.removeButtonContainer) {
      removeButtonContainer = this.removeButtonContainer.cloneNode(true);
      instanceContainer.appendChild(removeButtonContainer);
      removeButtonContainer.appendChild(removeButton);
    } else {
      instanceContainer.appendChild(removeButton);
    }

    // Increment the iteration counter.
    this.currentIteration++;
    return instanceContainer;
  }

  /**
   * Creates a new instance from the template.
   * @return {object} A div element containing a clone of the nodes in this
   * template.
   */
  createInstance () {
    var prefix = "";
    var nodes;
    var instanceContainer = document.createElement('div');
    var removeButton = this.removeButton || document.createElement('div');
    var removeButtonContainer = null;

    // Add each class from the template to the new instance.
    for (let classIndex in this.classList) {
      instanceContainer.classList.add(this.classList[classIndex]);
    }
    // Remove multiform and multiform-item classes form the new instance as
    // they're only used to itentify items to be cloned.
    instanceContainer.classList.remove("multiform", "multiform-item");

    // Create a button to remove this instance.
    if (this.removeButton) {
      removeButton = this.removeButton.cloneNode(true);
    } else {
      removeButton.innerHTML = 'Remove';
    }

    // Set the removeButton's type only if it's not already set.
    if (!removeButton.getAttribute('type')) {
      removeButton.setAttribute('type', 'button');
    }

    // Add additional classes
    removeButton.classList.add('btn');
    if ($(removeButton).filter("*[class^='btn-']").length == 0) {
        removeButton.classList.add('btn-danger');
    }
    removeButton.classList.add('multiform-remove');
    // Set up the instance prefix as "[<prefix>_]<iteration>-".
    if (this.prefix) {
      prefix = this.prefix + "_";
    }
    prefix += this.currentIteration.toString() + "-";

    // Set the item container ID and the remove button data to point to it.
    instanceContainer.id = prefix + 'item_container';
    removeButton.setAttribute('data-itemcontainer', instanceContainer.id);

    // Create a set of nodes and populate the new container.
    nodes = cloneFormNodes(this.nodes, prefix);
    for(var node in nodes) {
      instanceContainer.appendChild(nodes[node]);
    }

    // Append the remove button last.
    if (this.removeButtonContainer) {
      removeButtonContainer = this.removeButtonContainer.cloneNode(true);
      instanceContainer.appendChild(removeButtonContainer);
      removeButtonContainer.appendChild(removeButton);
    } else {
      instanceContainer.appendChild(removeButton);
    }

    // Increment the iteration counter.
    this.currentIteration++;
  }
}


class multiFormInstance{

  setupControls() {
    // Set the controls container's ID to <prefix>-multiform_controls
    this.controlsContainer.setAttribute(
      'id',
      this.prefix + '-multiform_controls'
    );

    // Locate a template for the add button or create one, then clone and remove
    // the template if it exists inside the container.
    if (this.addButtonTemplate) {
      if ($(this.container).find(this.addButtonTemplate).length) {
        this.addButton = this.addButtonTemplate.cloneNode(true);
        this.controlsContainer.appendChild(this.addButton);
        this.container.removeChild(this.addButtonTemplate);
      } else {
        this.addButton = this.addButtonTemplate;
      }
    } else {
      this.addButton = document.createElement('div');
      this.addButton.innerHTML = 'Add';
      this.controlsContainer.appendChild(this.addButton);
    }

    // Add btn class
    this.addButton.classList.add('btn');
    // Only add btn-success if another type of button hasn't been set
    if ($(this.addButton).filter("*[class^='btn-']").length == 0) {
      this.addButton.classList.add('btn-success');
    }
    // Set the controls container's ID to <prefix>-multiform_add
    this.addButton.setAttribute('id', this.prefix + '-multiform_add');
    // Set the removeButton's type only if it's not already set.
    if (!this.addButton.getAttribute('type')) {
      this.addButton.setAttribute('type', 'button');
    }
  }

  setupRemoveButton() {
    // Clone the remove button template and remove the original
    // Clone remove button from template or create remove button, then

    if (this.removeButtonTemplate && this.removeButtonContainerTemplate) {
      this.removeButtonContainerTemplate.removeChild(this.removeButtonTemplate);
      this.removeButton = this.removeButtonTemplate;
    } else if (this.removeButtonContainerTemplate) {
      this.removeButton = document.createElement('div');
      this.removeButton.innerHTML = 'X';
      removeButtonContainerTemplate.removeChild(this.removeButtonTemplate);
    } else if (this.removeButtonTemplate) {
      this.removeButton = this.removeButtonTemplate.cloneNode(true);
      this.container.removeChild(this.removeButtonTemplate);
    } else {
      this.removeButton = document.createElement('div');
      this.removeButton.innerHTML = 'X';
    }

    this.removeButton.classList.add(this.prefix + '-multiform_remove');
  }

  constructor(container) {
    this.container = container;
    this.controlsContainer = document.createElement('div');
    this.prefix = $(this.container).data('prefix');
    this.addButtonTemplate = $('#' + this.prefix + '-add_button'
      )[0] || undefined;
    this.addButton = undefined;
    this.removeButton = undefined
    this.removeButtonContainerTemplate = $(this.container).children(
      '.remove-container')[0] || undefined;
    this.removeButtonTemplate = $(
      this.removeButtonContainerTemplate || this.container
    ).children('.remove-button')[0] || undefined;
    this.items = new Array();
    let items = $('.' + this.prefix + '-multiform_item');
    this.postAddFunc = undefined;

    this.setupControls()
    this.setupRemoveButton()

    // Create a template object from container with remaining elements
    this.template = new Template({
      baseObject: this.container,
      prefix: this.prefix,
      removeButton: this.removeButton,
      removeButtonContainer: this.removeButtonContainer
    });

    // Add controls container before items
    this.container.appendChild(this.controlsContainer);

    // Build the list of items generated from items with a class of
    // <prefix>-multiform_item
    this.addItem = (index, item) => {
      this.items[index] = new Template({
        baseObject: item,
        prefix: this.prefix,
        removeButton: this.removeButton,
        removeButtonContainer: this.removeButtonContainer,
        iteration: index
      }).instance();
      this.container.appendChild(this.items[index]);
      item.parentElement.removeChild(item);
    }
    items.each(this.addItem, this);

    // Start new item itterations after the prepopulated items.
    this.template.currentIteration = items.length;

    // Create an instance of the template to start the form.
    this.container.appendChild(this.template.instance());

    // When the add button is clicked create an instance of the template and
    // append it to the container.
    $("#" + this.prefix + "-multiform_add").click(() => {
      this.container.appendChild(this.template.instance());

      if (this.postAddFunc) {
        this.postAddFunc();
      }
    });
  }
}

/**
 * Represents the container for the multiform instances and controls.
 * @constructor
 * @param {object} containerObject - The DOM object containing multiform.
 */
function MultiformContainer(containerObject, addButton, controlsContainer) {
  this.container = containerObject;
  this.controlsContainer = controlsContainer || null;
  this.addButton = null;

  if (addButton) {
    if ($(containerObject).find(addButton).length){
      this.addButton = addButton.cloneNode(true);
    } else {
      this.addButton = addButton;
    }
  } else {
    this.addButton = document.createElement('div')
    this.addButton.innerHTML = 'Add';
  }
  // Set the removeButton's type only if it's not already set.
  if (!this.addButton.getAttribute('type')) {
    this.addButton.setAttribute('type', 'button');
  }
  // Add additional classes
  this.addButton.classList.add('btn');
  if ($(this.addButton).filter("*[class^='btn-']").length == 0) {
    this.addButton.classList.add('btn-success');
  }
  this.addButton.setAttribute('id', 'multiform-add');
  if (!this.controlsContainer) {
    this.controlsContainer = document.createElement('div');
    this.container.appendChild(this.controlsContainer);
  }
  this.controlsContainer.setAttribute('id', 'multiform-controls');
  if (! $(this.controlsContainer).find(this.addButton)) {
    this.controlsContainer.appendChild(this.addButton);
  }

  /**
   * Append a child to the container.  This is simply created to prevent container.container.appendChild()
   * @param {object} child - The DOM object to append to the container
   */
  this.appendChild = function(child) {
    this.container.appendChild(child);
    // Unbind click handlers as they stack
    $(".multiform-remove").unbind("click");
    // Handle remove button click to remove an item
    $(".multiform-remove").click(function() {
      $("#" + $(this).data("itemcontainer")).remove();
    });
  }
}

var multiForm = {};

(function( $ ) {
  multiForm.forms = {};

  /**
   * Build a template for a multi-record form from a jQuery selector.
   * @param {function} func - An optional function to be called on add button
   * click and after the appendChild completes.
   */
  $.fn.multiFormTemplate = function() {
    // Iterate each template
    this.each( function () {
      let template_prefix = $(this).data('prefix');

      // Create the container for all form entries.
      multiForm.forms[template_prefix] = new multiFormInstance(this);
    });
  }

  /**
   * Build a multi-record form from a jQuery selector.
   * @param {string} prefix - The prefix to set on all field names.
   * @param {function} func - An optional function to be called on add button click and after the appendChile completes.
   */
  $.fn.multiForm = function(prefix, func) {
    // Create a list of items to prepopulate into the form and an array to populate with templates for these items.
    var items = this.filter(".multiform-item");
    var itemsArray = Array();
    var postAddFunc = func || null;
    var itemTemplate = $(this.not(".multiform-item"))[0]
    var controlsContainer = $('#multiform-controls-container')[0] || null;
    var addButtonTemplate = $('#multiform-add')[0] || null;
    var addButton = null;
    var removeButtonContainerTemplate = $(itemTemplate).children('#multiform-remove-container')[0] || null;
    var removeButtonContainer = null;
    var removeButtonTemplate = null;
    var removeButton = null;

    if (removeButtonContainerTemplate) {
      removeButtonTemplate = $(removeButtonContainerTemplate).children('#multiform-remove')[0] || null;
    } else {
      removeButtonTemplate = $(itemTemplate).children('#multiform-remove')[0] || null;
    }

    if (addButtonTemplate) {
      if ($(itemTemplate).find(addButtonTemplate).length){
        addButton = addButtonTemplate.cloneNode(true);
        itemTemplate.removeChild(addButtonTemplate);
      } else {
        addButton = addButtonTemplate;
      }
    }
    if (removeButtonTemplate) {
      removeButton = removeButtonTemplate.cloneNode(true);
      if (removeButtonContainerTemplate) {
        removeButtonContainerTemplate.removeChild(removeButtonTemplate);
      } else {
        itemTemplate.removeChild(removeButtonTemplate);
      }
    }
    if (removeButtonContainerTemplate) {
      removeButtonContainer = removeButtonContainerTemplate.cloneNode(true);
      itemTemplate.removeChild(removeButtonContainerTemplate);
    }

    // Create a template object from the first object in the jQuery selector.
    var template = new Template(this.not(".multiform-item")[0], prefix, removeButton, removeButtonContainer);

    // Create the container for all form entries.
    var container = new MultiformContainer(this.not(".multiform-item")[0], addButton, controlsContainer);

    // Reset the container's classList and set the id
    container.container.classList = [];
    container.container.id = 'multiform-container';

    // Create templates from multiform-item marked with multiform-item class and
    // populate them into the form.
    for (var itemIndex = 0, size = items.length; itemIndex < items.length; itemIndex++) {
      itemsArrayIndex = itemsArray.length;
      itemsArray[itemsArrayIndex] = new Template(items[itemIndex], prefix, removeButton, removeButtonContainer);
      itemsArray[itemsArrayIndex].currentIteration = itemIndex;
      container.appendChild(itemsArray[itemsArrayIndex].createInstance());
      items[itemIndex].parentElement.removeChild(items[itemIndex]);
    }

    // Since there may be items prepopulated, the form iterations for new items should start after this index.
    template.currentIteration = items.length;

    // Create an instance of the template to start the form.
    container.appendChild(template.createInstance());

    // When the add button is clicked create an instance of the template and append it to the container.
    $("#multiform-add").click(function() {
      container.appendChild(template.createInstance());

      if (postAddFunc) {
        postAddFunc();
      }
    });
    return this;
  };
}( jQuery ));
