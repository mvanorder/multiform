describe( "Multiform", function () {

  beforeEach(function() {
    loadFixtures('multiform/formFixture.html');
    indicator_var = 0;
    $('.multiform-template').multiFormTemplate({
      postAddFunction: function() {
        indicator_var++;
      }
    });
  });

  it("generates a form from the template.", function() {
    // There should be one form
    expect(Object.keys(multiForm.forms).length).toBe(1);
    var form_prefix = Object.keys(multiForm.forms)[0];

    // There should be an add button with an ID of <prefix>-multiform_add
    expect($('#' + form_prefix + '-multiform_add').length).toBe(1);

    // There should be one more item <prefix>_<itteration>-item_container than there
    // are items with the class of <prefix>-multiform_item.
    var generated_items = $(
      "*[id^='" + form_prefix + "_']"
    ).filter("*[id$=-item_container]");
    var prepopulated_items = $('.' + form_prefix + '-multiform_item');
    expect(generated_items.length).toBe(prepopulated_items.length + 1);

    //the current itteration index should be the number of generated items
    expect(multiForm.forms[form_prefix].template.currentIteration).toBe(
      generated_items.length
    );

    // Each generated item should have a remove button with the itemcontainer
    // data attribute set to <prefix>_<itteration>-item_container
    generated_items.each( function(index) {
      var remove_button = $(this).find('.' + form_prefix + '-multiform_remove')
      expect(remove_button.length).toBe(1);
      expect($(remove_button[0]).data('itemcontainer')).toBe(
        form_prefix + '_' + index.toString() + '-item_container'
      );
    })
  });

  it(
    "adds a new item when <prefix>-multiform_add button is clicked.",
    function () {
      var form_prefix = Object.keys(multiForm.forms)[0];

      var generated_items = $(
        "*[id^='" + form_prefix + "_']"
      ).filter("*[id$=-item_container]");

      $('#' + form_prefix + '-multiform_add').click()
      var new_generated_items = $(
        "*[id^='" + form_prefix + "_']"
      ).filter("*[id$=-item_container]");

      expect(new_generated_items.length).toBe(generated_items.length + 1);
    }
  );

  it(
    "calls the postAddFunction after item is added by the add button.",
    function () {
      var form_prefix = Object.keys(multiForm.forms)[0];
      var indicator_var_pre = indicator_var;

      $('#' + form_prefix + '-multiform_add').click()

      expect(indicator_var).toBe(indicator_var_pre + 1);
    }
  );

  it(
    "removes an item when <prefix>-multiform_remove is clicked.",
    function () {
      var form_prefix = Object.keys(multiForm.forms)[0];
      var generated_items = $(
        "*[id^='" + form_prefix + "_']"
      ).filter("*[id$=-item_container]");

      generated_item = generated_items.first();
      generated_item.find('.' + form_prefix + '-multiform_remove').click()

      var new_generated_items = $(
        "*[id^='" + form_prefix + "_']"
      ).filter("*[id$=-item_container]");

      expect(new_generated_items.length).toBe(generated_items.length - 1);
    }
  );
});
