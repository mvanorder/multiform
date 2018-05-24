## MultiForm

Multiform is a jQuery plugin for creating a one-to-many form with n iterations.  It templates the elements in the selected HTML element and creates instances of that element with the Add button. These instances get prefixed with a specified prefix and the iteration of the element.

### Requirements

* jQuery 1.4.3 or greater

**Note:** Bootstrap complains if jQuery is below version 1.9.1, however this plugin only uses bootstrap's CSS.

### Usage

**Basic usage**

As shown in the demos you need an element which contains all the elements to be templated.  Example:

```html
<div class="multiform-template" data-prefix="test_prefix">
  <label for="id_ingredient">Ingredient:</label>
  <select name="ingredient" required id="id_ingredient">
    <option value="" selected>---------</option>
    <option value="1">butter</option>
    <option value="2">flour</option>
    <option value="3">milk</option>
    <option value="4">eggs</option>
  </select>
  <label for="id_quantity_amount">Qty:</label>
  <input type="text" name="quantity_amount" required maxlength="8" id="id_quantity_amount" />
  <label for="id_quantity">Quantity:</label>
  <select name="quantity" id="id_quantity">
    <option value="" selected>---------</option>
    <option value="1">count</option>
    <option value="2">dozen</option>
    <option value="3">Dash</option>
    <option value="4">Pinch</option>
    <option value="5">Teaspoon</option>
    <option value="6">Tablespoon</option>
    <option value="7">Fluid ounce</option>
    <option value="8">Cup</option>
    <option value="9">Pint</option>
    <option value="10">Quart</option>
    <option value="11">Gallon</option>
  </select>
</div>
```

In order to apply the multiform plugin simply add the JavaScript and call it as follows:

```html
<script src="multiform.js"></script>
<script>
  $(".multiform-template").multiFormTemplate();
</script>
```
the multiform function accepts one string parameter, it is the prefix which will be added to every cloned element.  Any element with a name or id, and any *for* attribute in labels will be prepended with ```{{prefix}}_{{iteration}}-```

**Prepopulating entries**

As shown in the demos there are 3 divs containing fields, but 2 of them have the *test_prefix-multiform_item* class as follows:

```html
<div class="test_prefix-multiform_item">

  ...

</div>
<div class="test_prefix-multiform_item">

  ...

</div>
<div class="multiform-template" data-prefix="test_prefix">

  ...

</div>
```
Multiform looks for the *{{prefix}}_{{iteration}}-multiform_item* class to determine which items are prepopulated and should be imported as entries for this form.

**Element prefixing**

```{{prefix}}_{{iteration}}-```

This structure is designed to match django's form prefix structure for easy integration into django views and forms, and should be easily adoptable into other frameworks

If there are prepopulated entries, these will get processed first and receive the first iterations starting with 0, any new entries created will start at index *n* where *n* is the number of prepopulated entries.

**Post add function**

You can specify a function to be called after the *Add* button is clicked.  An example can be seen in the materialize-demo.html and materialize-demo_custom_comtainers.html.  Since Materialize requires a jQuery call to properly render select fields we'll need to do this after new ones are created.  Do to this, we can pass a function as the postAddFunction argument to $.fn.multiFormTemplate() as follows:

```javascript
$( ".multiform-template" ).multiFormTemplate({
  postAddFunction: function() {
    $('select').formSelect();
  }
});
```

**Custom buttons and containers**

* **Add** button can be customized as an element with an id of *{{prefix}}_{{iteration}}-add_button*.  If the template is in .multiform-template, it will be relocated to a controls container at the top of the form.  Otherwise it will be left where it is.
* **Controls container** contains the add button(and possibly in future versions, additional controls).  This can be templated as a child of .multiform-template with an id of *{{prefix}}_{{iteration}}-multiform_controls*.
* **Remove** button can be customized as a child of .multiform-template with the id of *remove-button*.  If a remove button container is templated the remove button template should be a child of it.
* **Remove button container** is an optional container for the remove button.  If not templated, it won't be created.  To template it simply create an element with the class *remove-container* as a child of .multiform-template.

### Compatibility

Currently needs to be tested.

### Licensing

* Copyright (c) 2017 Malcolm VanOrder.
* Licensed under the [MIT](https://opensource.org/licenses/mit-license.php) license.

### Todo

* Test and improve browser support.
