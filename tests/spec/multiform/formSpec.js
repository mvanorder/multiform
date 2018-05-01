describe( "Multiform", function () {

  beforeEach(function() {
    loadFixtures('multiform/formFixture.html');
  });

  it("template is generated", function() {
    $('.multiform-template').multiFormTemplate();

    expect(Object.keys(multiForm.templates).length).toBe(1);
  });
});
