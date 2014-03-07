### Synopsis
UI.emboxValue runs its inner function one more time even if the dependent has
been stopped. This happens when you use UI.With.

### Reproduction

1. Open JavaScript console and run with release/blaze-rc0.
2. You should see "Template.two: options helper called" in the console.
3. Click the "Toggle Template" button.
4. In the console you should see the CHANGE DATA message followed by:

  a. Template.one: options helper called
  
  b. Template.two: options helper called (again even though template is off page)

### Why

Clicking the toggle button does two things:

1. Set a Session value that causes the rendered template to change.
2. Calls `dataDep.changed()` which invalidates the global data function.

Both templates' data functions call this global data function. When we call
`dataDep.changed()` any dependent computations will be invalidated.

When we write `{{#with options}}` in the template, it compiles to something like
this:

```javascript
var render = function () {

  // The first argument to UI.With will become an
  // emboxedValue and that becomes the data property of
  // the returned component.

  return UI.With(function () {
    // this lookup calls our global data function, creating
    // the dependency
    return Spacebars.call(self.lookup('options'));
  }, UI.block(function () {
    return content;
  });
};
```
