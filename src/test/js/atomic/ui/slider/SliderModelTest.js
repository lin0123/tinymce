test(
  'Atomic Test: ui.slider.SliderModelTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.ui.slider.SliderModel',
    'ephox.katamari.api.Option',
    'ephox.wrap-jsverify.Jsc',
    'global!Math'
  ],

  function (RawAssertions, SliderModel, Option, Jsc, Math) {
    var arb1Up = Jsc.nat.smap(function (num) { return num + 1; }, function (num) { return num - 1; });

    var arbRanged = Jsc.bless({
      generator: Jsc.nat.generator.flatMap(function (min) {
        return arb1Up.generator.flatMap(function (width) {
          var max = min + width;
          return Jsc.number(min - 1, max + 1).generator.map(function (value) {
            var v = Math.round(value);

            return {
              min: min,
              max: max,
              value: v
            };
          });
        });
      })
    });

    var arbData = Jsc.tuple([arbRanged, arb1Up, Jsc.bool]).smap(
      function (arr) {
        return {
          min: arr[0].min,
          max: arr[0].max,
          value: arr[0].value,
          stepSize: arr[1],
          snapToGrid: arr[2]
        };
      },
      function (r) {
        return [
          { min: r.min, max: r.max, value: r.value },
          r.stepSize,
          r.snapToGrid
        ];
      }
    );

    var arbBounds = Jsc.bless({
      generator: Jsc.nat.generator.flatMap(function (min) {
        return arb1Up.generator.map(function (width) {
          return {
            left: min,
            width: width,
            right: min + width
          };
        });
      })
    });


    Jsc.syncProperty(
      'Reducing never goes beyond min-1',
      [
        arbData
      ], function (data) {
        var newValue = SliderModel.reduceBy(data.value, data.min, data.max, data.stepSize);
        RawAssertions.assertEq('Checking value', true, newValue <= data.value && newValue >= data.min - 1);
        return true;
      },
      { }
    );

    Jsc.syncProperty(
      'Increasing never goes beyond max+1',
      [
        arbData
      ], function (data) {
        var newValue = SliderModel.increaseBy(data.value, data.min, data.max, data.stepSize);
        RawAssertions.assertEq('Checking value', true, newValue >= data.value && newValue <= data.max + 1);
        return true;
      },
      { }
    );

    Jsc.syncProperty(
      'Finding value of snapped always results in a factorable value',
      [
        arbData,
        arbBounds,
        Jsc.nat
      ],
      function (data, bounds, xValue) {
        var newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, true, Option.none());
        var f = Math.abs((newValue - data.min) / data.stepSize);
        RawAssertions.assertEq('Checking factors correctly: ' + newValue, true,
          Math.floor(f) === f || newValue === data.min - 1 || newValue === data.max + 1
        );
        return true;
      },
      { }
    );

    Jsc.syncProperty(
      'Finding value of snapped always results in a factorable value with a snap start',
      [
        arbData,
        arbBounds,
        Jsc.nat,
        Jsc.nat
      ],
      function (data, bounds, xValue, snapOffset) {
        var newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, true, Option.some(snapOffset + data.min));
        var f = Math.abs((newValue - (data.min + snapOffset)) / data.stepSize);
        RawAssertions.assertEq('Checking factors correctly: ' + newValue, true,
          Math.floor(f) === f || newValue === data.min - 1 || newValue === data.max + 1
        );
        return true;
      },
      { }
    );

    Jsc.syncProperty(
      'Finding value of any value always fits in the [min - 1, max + 1] range',
      [
        arbData,
        arbBounds,
        Jsc.nat
      ],
      function (data, bounds, xValue) {
        var newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, data.snapToGrid, Option.none());
        RawAssertions.assertEq(
          'Assert within range: ' + newValue, true,
          newValue >= data.min - 1 && newValue <= data.max + 1
        );
        return true;
      }
    );

    Jsc.syncProperty(
      'Finding value of any value always fits in the [min - 1, max + 1] range with a snap start',
      [
        arbData,
        arbBounds,
        Jsc.nat,
        Jsc.nat
      ],
      function (data, bounds, xValue, snapOffset) {
        var newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, data.snapToGrid, Option.some(snapOffset + data.min <= data.max ? snapOffset + data.min : data.max));
        RawAssertions.assertEq(
          'Assert within range: ' + newValue, true,
          newValue >= data.min - 1 && newValue <= data.max + 1
        );
        return true;
      }
    );
  }
);