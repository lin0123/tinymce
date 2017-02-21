define(
  'tinymce.themes.mobile.api.IosWebapp',

  [
    'ephox.boulder.api.ValueSchema',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.api.MobileSchema',
    'tinymce.themes.mobile.touch.view.TapToEditMask'
  ],

  function (ValueSchema, Insert, Css, MobileSchema, TapToEditMask) {
    var produce = function (raw) {
      var mobile = ValueSchema.asRawOrDie(
        'Getting IosWebapp schema',
        MobileSchema,
        raw
      );

      /* Make the toolbar scrollable */
      Css.set(mobile.toolstrip, 'width', '100%');
      Css.set(mobile.toolbar, 'overflow-x', 'auto');
      
      Insert.append(mobile.socket, mobile.editor.getFrame());

      Css.set(mobile.container, 'position', 'relative');
      var mask = TapToEditMask();

      mask.events.fullscreen.bind(function () {
        mask.hide();
        mode.enter();
      });

      Insert.append(mobile.container, mask.element());
      mask.show();

      var mode = IosMode.create(mobile, mask);

      return {
        enter: mode.enter,
        exit: mode.exit
      };
    };

    return {
      produce: produce
    };
  }
);
