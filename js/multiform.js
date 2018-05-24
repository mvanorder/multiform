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

  /**
   * Creates a new instance from the template.
   * @return {object} A div element containing a clone of the nodes in this
   * template.
   */
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

    let removeButtonContainer = undefined;
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
    $(removeButton).click(() => {
      instanceContainer.parentElement.removeChild(instanceContainer);
    });

    return instanceContainer;
  }
}


/**
 * Represents the container for the multiform instances and controls.
 * @constructor
 * @param {object} containerObject - The DOM object containing multiform.
 */
class multiFormInstance{

  setupControls() {
    if (this.controlsContainerTemplate) {
      this.controlsContainer = this.controlsContainerTemplate.cloneNode(true);
      this.controlsContainerTemplate.parentElement.removeChild(
        this.controlsContainerTemplate
      );
    } else {
      this.controlsContainer = document.createElement('div');
      // Set the controls container's ID to <prefix>-multiform_controls
      this.controlsContainer.setAttribute(
        'id',
        this.prefix + '-multiform_controls'
      );
    }

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
      this.removeButtonContainerTemplate.parentElement.removeChild(
        this.removeButtonContainerTemplate
      );
      this.removeButton = this.removeButtonTemplate;
      this.removeButtonContainer = this.removeButtonContainerTemplate;
    } else if (this.removeButtonContainerTemplate) {
      this.removeButton = document.createElement('div');
      this.removeButton.innerHTML = 'Remove';
      removeButtonContainerTemplate.removeChild(this.removeButtonTemplate);
    } else if (this.removeButtonTemplate) {
      this.removeButton = this.removeButtonTemplate.cloneNode(true);
      this.container.removeChild(this.removeButtonTemplate);
    } else {
      this.removeButton = document.createElement('div');
      this.removeButton.innerHTML = 'Remove';
    }

    this.removeButton.classList.add(this.prefix + '-multiform_remove');
  }

  constructor(container, args) {
    this.container = container;
    this.prefix = $(this.container).data('prefix');
    this.controlsContainerTemplate = $('#' + this.prefix + '-multiform_controls'
      )[0];
    this.controlsContainer = undefined;
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
    this.postAddFunction = undefined;
    if (args) {
      this.postAddFunction = args.postAddFunction;
    }

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

      if (this.postAddFunction) {
        this.postAddFunction();
      }
    });
    if (args) {
      // Remove all classes from the container.
      for (var i = 0; i < this.container.classList.length + 1; i++) {
        this.container.classList.remove(
          this.container.classList[this.container.classList.length - 1]
        );
      }
      // Add specified classes to the container.
      this.container.classList.add(args.containerClassList);
    }
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
  $.fn.multiFormTemplate = function(args) {
    // Iterate each template
    this.each( function () {
      let template_prefix = $(this).data('prefix');

      // Create the container for all form entries.
      multiForm.forms[template_prefix] = new multiFormInstance(
        this, args
      );
    });
  }
}( jQuery ));
