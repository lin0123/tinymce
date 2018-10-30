import { Pipeline, Step, FocusTools, Mouse, Waiter, UiFinder, Assertions, Log, Logger, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';

import 'tinymce/themes/silver/Theme';

import { Element, SelectorFilter } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import ColorSwatch from '../../../../../main/ts/ui/core/color/ColorSwatch';

UnitTest.asynctest('ColorPickerSanityTest', (success, failure) => {
  // mutation is yummy
  let currentColor = '';

  const setColor = (hex) => {
    currentColor = hex;
  };

  const dialogSelector = 'div[role="dialog"]';

  const docBody = Element.fromDom(document.body);

  const sAssertColor = function (expected) {
    return Logger.t('Asserting color', Step.sync(function () {
      Assertions.assertEq('Asserting language dropdown is ' + expected, expected, currentColor);
    }));
  };

  const sSetHex = (hex) => {
    return Logger.t('Changing textarea content to ' + hex, Step.sync(() => {
      const inputs = SelectorFilter.descendants(docBody, 'div[role="dialog"] input');
      const hexInput = inputs[inputs.length - 1];
      hexInput.dom().value = hex;
    }));
  };

  const sOpenDialog = (editor, docBody) => {
    return GeneralSteps.sequence(Logger.ts('Open dialog and wait for it to be visible', [
      Step.sync(function () {
        const dialog = ColorSwatch.colorPickerDialog(editor);
        dialog(setColor, '#ffffff');
      }),
      UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector)
    ]));
  };

  const sAssertColorWhite = sAssertColor('#ffffff');

  const sAssertColorBlack = sAssertColor('#000000');

  const sSetHexWhite = sSetHex('ffffff');

  const sSetHexBlack = sSetHex('000000');

  const sSubmitDialog = GeneralSteps.sequence(Logger.ts('Click Ok and close dialog', [
    FocusTools.sSetFocus('Focus dialog', docBody, dialogSelector),
    Waiter.sTryUntil('Button is not disabled', UiFinder.sNotExists(docBody, 'button.tox-button:contains("Ok")[disabled]'), 100, 1000),
    Mouse.sClickOn(docBody, 'button.tox-button:contains(Ok)'),
    Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000),
  ]));

  const sCancelDialog = GeneralSteps.sequence(Logger.ts('Click Cancel and close dialog', [
    FocusTools.sSetFocus('Focus dialog', docBody, dialogSelector),
    Mouse.sClickOn(docBody, 'button.tox-button:contains(Cancel)'),
    Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000),
  ]));

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'ColorPicker: Open dialog, click Ok and assert color is white', [
        sOpenDialog(editor, docBody),
        sSubmitDialog,
        sAssertColorWhite
      ]),

      Log.stepsAsStep('TBA', 'ColorPicker: Open dialog, pick a color, click Ok and assert color changes to picked color', [
        sOpenDialog(editor, docBody),
        sSetHexBlack,
        sSubmitDialog,
        sAssertColorBlack
      ]),

      Log.stepsAsStep('TBA', 'ColorPicker: Open dialog, pick a different color, click Cancel and assert color does not change', [
        sOpenDialog(editor, docBody),
        sSetHexWhite,
        sCancelDialog,
        sAssertColorBlack
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    theme: 'silver',
    toolbar: '',
    skin_url: '/project/js/tinymce/skins/oxide',
  }, success, failure);
});