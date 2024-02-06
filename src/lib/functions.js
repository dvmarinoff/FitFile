function equals(a, b) {
    return Object.is(a, b);
}

function exists(x) {
    if(equals(x, undefined) || equals(x, null)) return false;
    return true;
}

function isFunction(x) {
    return equals(typeof x, 'function');
}

function isArray(x) {
    return Array.isArray(x);
}

function isArrayBuffer(x) {
    return x instanceof ArrayBuffer;
}

function isDataView(x) {
    return x instanceof DataView;
}

function isObject(x) {
    return equals(typeof x, 'object') && !(isArray(x));
}

function isString(x) {
    return equals(typeof x, 'string');
}

function isNumber(x) {
    if(isNaN(x)) return false;
    return equals(typeof x, 'number');
}

function clamp(lower, upper, value) {
    if(value >= upper) {
        return upper;
    } else if(value < lower) {
        return lower;
    } else {
        return value;
    }
}

function compose2(f, g) {
    return function(...args) {
        return f(g(...args));
    };
}

function compose(...fns) {
    return fns.reduce(compose2);
}

function pipe(...fns) {
    return fns.reduceRight(compose2);
}

function repeat(n) {
    return function(f) {
        return function(x) {
            if (n > 0) {
                return repeat(n - 1)(f)(f(x));
            } else {
                return x;
            }
        };
    };
};

function curry2(fn) {
    return function (arg1, arg2) {
        if(exists(arg2)) {
            return fn(arg1, arg2);
        } else {
            return function(arg2) {
                return fn(arg1, arg2);
            };
        }
    };
}

const nth = curry2(function(offset, xs) {
    let i = (offset < 0) ? (xs.length + offset) : (offset);
    if(isString(xs)) {
        return xs.charAt(i);
    }
    return xs[i];
});

const prop = curry2(function(p, x) {
    if(!exists(x)) return;
    return Number.isInteger(p) ? nth(p, x) : x[p];
});


function first(xs) {
    return nth(0)(xs);
}

function last(xs) {
    return nth(-1)(xs);
}

function empty(x) {
    if(isObject) return (Object.keys(x).length === 0);
    return x.length === 0;
}

const f = {
    '_': {'@@functional/placeholder': true},
    'q': function(value) { return function() {return value;}; },
    'I': (x) => x,
    'true': (x) => true,
    'false': (x) => false,
    'equals': curry2(equals),
};


async function wait(ms) {
    return await new Promise(res => setTimeout(res, ms));
}

function expect(x, msg = 'expected value here') {
    if(exists(x)) return x;
    throw new Error(msg);
}

function Spec(args = {}) {
    const definitions = expect(args.definitions);

    const applyResolution = curry2((prop, value) => {
        return value / definitions[prop].resolution;
    });

    const removeResolution = curry2((prop, value) => {
        return value * definitions[prop].resolution;
    });

    function encodeField(prop, input, transform = applyResolution(prop)) {
        const fallback = definitions[prop].default;
        const min      = applyResolution(definitions[prop].min);
        const max      = applyResolution(definitions[prop].max);
        const value    = input ?? fallback;

        return Math.floor(clamp(min, max, transform(value)));
    }

    function decodeField(prop, input, transform = removeResolution) {
        return transform(prop, input);
    }

    return {
        definitions,
        applyResolution,
        removeResolution,
        encodeField,
        decodeField,
    };
}

// binary
function nthBit(field, bit) {
    return (field >> bit) & 1;
};

function setBit(i, n) {
    return n |= (1 << i);
}

function getBits(start, end, value) {
    return (value >> start) & ((1 << (end - start)) - 1);
}

function xor(view, start = 0, end = view.byteLength) {
    let cs = 0;
    const length = (end < 0) ? (view.byteLength + end) : end;
    for (let i=start; i < length; i++) {
        cs ^= view.getUint8(i);
    }
    return cs;
}

// Util formaters
function hex(n) {
    return '0x' + parseInt(n).toString(16).toUpperCase().padStart(2, '0');
}

function toFixed(x, points = 2, fallback = 0) {
    if(!isNumber(x)) return fallback;
    const precision = 10**points;
    return Math.round(x * precision) / precision;
}

function clock(elapsed = 0) {
    let hr = Math.floor(elapsed / 3600);
    let hh = (hr > 0) ? hr + ':' : '';
    let mm = (Math.floor(elapsed % 3600 / 60)).toString().padStart(2, '0');
    let ss = (elapsed % 60).toString().padStart(2, '0');
    return hh + mm + ':' + ss;
}

function time() {
    const d = new Date();
    const mm = (d.getMinutes()).toString().padStart(2, '0');
    const ss = (d.getSeconds()).toString().padStart(2, '0');
    const mmmm = (d.getMilliseconds()).toString().padStart(4, '0');
    return `${mm}:${ss}:${mmmm}`;
}

function dataviewToArray(dataview = new Uint8Array().buffer) {
    return Array.from(new Uint8Array(dataview.buffer));
}

function arrayBufferToArray(buffer) {
    return Array.from(new Uint8Array(buffer));
}

function sum(xs) {
    return xs.reduce((acc, x) => {
        acc += x;
        return acc;
    }, 0);
}

function avg(xs) {
    if(xs.length === 0) return undefined;
    return sum(xs) / xs.length;
}

function FileHandler() {

    // Blob | File -> ?
    function readText(file) {
        const reader = new FileReader();
        reader.readAsText(file);

        return new Promise((resolve, reject) => {
            reader.onload = function(event) {
                return resolve(reader.result);
            };
            reader.onerror = function(event) {
                return reject(reader.error);
            };
        });
    }

    // Blob | File -> ?
    function readBinary(file) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        return new Promise((resolve, reject) => {
            reader.onload = function(event) {
                return resolve(reader.result);
            };
            reader.onerror = function(event) {
                return reject(reader.error);
            };
        });
    }

    // TODO: add download file

    return Object.freeze({
        readText,
        readBinary,
    });
}

const fileHandler = FileHandler();

export {
    equals,
    exists,
    isFunction,
    isObject,
    isArray,
    isArrayBuffer,
    isDataView,
    isString,
    isNumber,
    clamp,
    compose,
    compose2,
    pipe,
    repeat,
    nth,
    first,
    last,
    empty,
    prop,
    f,
    wait,
    expect,
    Spec,
    nthBit,
    setBit,
    getBits,
    hex,
    xor,
    toFixed,
    dataviewToArray,
    arrayBufferToArray,
    sum,
    avg,
    clock,
    time,
    fileHandler,
};

