## MultiForm

Multiform is a jQuery plugin for creating a one-to-many form.  It templates the elements in the first HTML element selected and creates instances of that element with the Add button prefixed with a specified prefix and the iteration of the element.

### Requirements

* jQuery - only tested on version 3.2.1 sofar, older versions will most likely work, but I'm unsure how old
* Bootstrap - This is only for styling the buttons, you can do so otherwise, but the button classes match bootstrap v3 standards.

### Usage

As shown in demo.html you need an element which contains all the elements to be templated.  Example:

```html
<div class="multiform">
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

In order to apply the multiform plugin simply add the javascript and call it as follows:

```html
<script src="multiform.js"></script>
<script>
  $(".multiform").multiForm("test_prefix");
</script>
```
the multiform function accepts one string parameter, it is the prefix which will be added to every cloned element.  Any element with a name or id or any **for** attribute in a label will be prepended with the following:

```{{prefix}}_{{iteration}}-```

if no prefix is provided, then it will be prepended as follows:

```{{iteration}}-```

This structure is designed to match django's form prefix structure for easy integration into django views and forms, and should be easily adoptable into other frameworks.

### Licensing

* Copyright (c) 2017 Malcolm VanOrder.
* Licensed under the [MIT](https://opensource.org/licenses/mit-license.php) license.

### Todo

* Add functionality to provide a list of elements to be prepopulated on the form creation(for update forms).
* Test minimum version of jquery.
* Test browser support.