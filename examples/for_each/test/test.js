var assert = require("assert"),
    forEach = require("../src/index");


describe("forEach", function() {
    it("should loop over array or object", function() {
        var array = [0, 1, 2],
            object = {
                0: 0,
                1: 1,
                2: 2
            };

        forEach(array, function(value, index) {
            assert.equal(array[index], value);
        });

        forEach(object, function(value, key) {
            assert.equal(object[key], value);
        });
    });
});
