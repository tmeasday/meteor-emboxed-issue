if (Meteor.isClient) {
  dataDep = new Deps.Dependency;

  UI.body.events({
    'click #toggle': function (e, tmpl) {
      var value = Deps.nonreactive(function () {
        return Session.get('showFirstTemplate');
      });

      // toggle the template
      Session.set('showFirstTemplate', !value);


      // now let's say that we set the session
      // value above, but now we invalidate
      // a computation that uses the emboxed
      // args which would be the template data
      // for example.

      // the problem here is that the emboxed
      // arg will run one more time before realizing
      // it doesn't have any more dependencies and
      // stopping itself.
      //
      // where did the emboxedArg collect this dependency?
      // when the options function was called with the data context as the
      // thisArg in Component.lookup.
      //
      // but it's only with emboxedArgs which get created with the UI.With
      // helper. If you're not using emboxedArg it's not an issue.

      console.log('%c**********CHANGE DATA**************', 'color: #ccc');
      dataDep.changed();
    }
  });

  Template.dynamicTemplates.showFirstTemplate = function (name) {
    return Session.equals('showFirstTemplate', true);
  };

  getData = function () {
    // when we invalidate the dataDep
    // like with a global data context
    // it will invalidate the inner computation
    // of the emboxedArg causing it to rerun
    // again. 
    dataDep.depend();
    return {forTemplate: Deps.nonreactive(function () {
      return Session.get('showFirstTemplate') ? 'one' : 'two';
    })};
  };

  Template.dynamicTemplates.oneData = function () {
    // this function gets emboxed because
    // {{#with options}} ... {{/with}}
    // compiles to:
    //  UI.With(function () {
    //    // the lookup binds the options function
    //    // to the template's data function
    //    // which in turn calls getData above
    //    return Spacebars.call(self.lookup('options'));
    //  }, UI.block(function () {
    //    ...
    //  });
    //
    //  the emboxing happens in the implementation of UI.With
    //  which takes the function parameter and emboxes it.
    return getData();
  };

  Template.one.helpers({
    options: function () {
      console.log('%cTemplate.one: options helper called with data for ' + this.forTemplate, 'color: blue;');
      return {foo: ['bar']};
    }
  });

  Template.dynamicTemplates.twoData = function () {
    return getData();
  };

  Template.two.helpers({
    options: function () {
      console.log('%cTemplate.two: options helper called with data for ' + this.forTemplate, 'color: green;');
      return {foo: ['bar']};
    }
  });
}
