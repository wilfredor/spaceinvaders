"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = void 0;
//------------Tool functions
//Check if a var exist
var Tool = /** @class */ (function () {
    function Tool() {
    }
    Tool.isset = function (obj, props) {
        if ((typeof (obj) === 'undefined') || (obj === null)) {
            return false;
        }
        else if (props && props !== undefined && props.length > 0) {
            return this.isset(obj[props.shift()], props);
        }
        return true;
    };
    //A random number multiple of 5
    Tool.randomRange = function (min, max) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    };
    return Tool;
}());
exports.Tool = Tool;
