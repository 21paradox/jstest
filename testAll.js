var promisesAplusTests = require("promises-aplus-tests");

const adapter1 = {};
// adapter.resolved = Promise.resolve;
// adapter.rejected = Promise.reject;
adapter1.deferred = () => {
    let out = {};
    const mypromise1 = require('./promise/implement1');
    const p = new mypromise1((resolve, rej) => {
        out.resolve = resolve;
        out.reject = rej;
    })
    out.promise = p;
    return out
}

const adapter2 = {};
// adapter.resolved = Promise.resolve;
// adapter.rejected = Promise.reject;
adapter2.deferred = () => {
    let out = {};
    const mypromise2 = require('./promise/implement2');
    const p = new mypromise2((resolve, rej) => {
        out.resolve = resolve;
        out.reject = rej;
    })
    out.promise = p;
    return out
}

promisesAplusTests(adapter1, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    console.log(err)
});
promisesAplusTests(adapter2, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    console.log(err)
});

