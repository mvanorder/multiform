## MultiForm

Multiform is a jQuery plugin for creating a one-to-many form.  It templates the elements in the first HTML element selected and creates instances of that element with the Add button prefixed with a specified prefix and the iteration of the element.

### Requirements

* jQuery 1.4.3 or greater
* Bootstrap - This is only for styling the buttons, you can optionally style them with custom stylesheets.  The button classes match bootstrap v3 standards.

**Note:** Bootstrap complains if jQuery is below version 1.9.1, however this plugin only uses bootstrap's CSS.

### Usage

**Basic usage**

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
the multiform function accepts one string parameter, it is the prefix which will be added to every cloned element.  Any element with a name or id or any *for* attribute in a label will be prepended with the following:

**Prepopulating entries**

As shown in demo.html there are 3 divs with the multiform class, but 2 of them have the *multiform-item* class as follows:

```html
<div class="multiform multiform-item">

  ...

</div>
<div class="multiform multiform-item">

  ...

</div>
<div class="multiform">

  ...

</div>
```
The shared class is not important as it's used in your javascript selector which multiform() is called on, however multiform looks for the *multiform-item* class to determine which items are prepopulated and should be imported as entries then prefixed.

**Element prefixing**

```{{prefix}}_{{iteration}}-```

if no prefix is provided, then it will be prepended as follows:

```{{iteration}}-```

This structure is designed to match django's form prefix structure for easy integration into django views and forms, and should be easily adoptable into other frameworks

If there are prepopulated entries, these will get processed first and receive the first iterations starting with 0, any new entries created will start at index *n* where *n* is the number of prepopulated entries.

**Post add function**

You can specify a function to be called after the *Add* button is clicked.  An example can be seen in the demo2.html which uses Materialize.  Since Materialize requires a jQuery call to properly render select fields we'll need to do this after new ones are created.  Do to this, we can call the $.fn.multiForm() function with a function provided as the second parameter as follows:

```javascript
function addItem(){
  $('select').formSelect();
}

$(".multiform").multiForm("test_prefix", addItem);
```

**Custom buttons**

* **Add** button can be customized as a child of .multiform with the id of *multiform-add*.
* **Remove** button can be customized as a child of .multiform with the id of *multiform-remove*.

This is demo'd in [demo3.html](demo3.html).

### Compatability

The following are based off of the compatability documented on Mozilla Developer Network for methods and properties used in the code and are not tested.

* Chrome: 29+
* Edge: 20+ (EdgeHTML 12.10240)
* Firefox: 23+
* Internet Explorer: yes
* Opera: yes
* Safari: 6+

### Licensing

* Copyright (c) 2017 Malcolm VanOrder.
* Licensed under the [MIT](https://opensource.org/licenses/mit-license.php) license.

### Todo

* Add functionality to provide a list of elements to be prepopulated on the form creation(for update forms).
* Test and improve browser support.
