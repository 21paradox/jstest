function hasOwn(obj, prop) {
    return hasOwnProperty.call(obj, prop);
}

function isPromiseLike(obj) {
    if (obj && hasOwn(obj, 'then')) {
        const objSafe = Object.getOwnPropertyDescriptors(obj);
        if (objSafe.then.get) {
            return isfn(objSafe.then.get)
        }
        return isfn(objSafe.then.value);
    }
    return false
}

const stateEnum = {
    resolved: 'resolved',
    pending: 'pending',
    rejected: 'rejected'
}

function delayfn(cb) {
    setTimeout(() => {
        cb()
    }, 0)
}

function isfn(fn) {
    return typeof fn === 'function'
}

function myPromise(initFn) {
    var self = this;

    this.dataResolved = undefined;
    this.dataRejected = undefined;
    this.state = stateEnum.pending;

    function finishState(v, data) {
        let cbRet;
        try {
            const fn = v.fn;
            cbRet = fn(data);
            if (v.recentPromise && v.recentPromise === cbRet) {
                v.reject(new TypeError('you can\'t return same promise'))
                return;
            }
        } catch (e) {
            v.reject(e);
            return;
        }

        if (isPromiseLike(cbRet)) {
            let called = false
            try {
                cbRet.then((cbRetResolved) => {
                    if (called) {
                        return;
                    }
                    called = true;
                    finishState({
                        ...v,
                        fn: () => cbRetResolved,
                    }, cbRetResolved);
                }, (verr) => {
                    if (called) {
                        return;
                    }
                    called = true;
                    v.reject(verr);
                });
            } catch (e) {
                if (!called) {
                    v.reject(e)
                }
            }
        } else {
            v.resolve(cbRet);
        }
    }

    function resolveFn(data) {
        if (self.state !== stateEnum.pending) {
            return;
        }
        self.dataResolved = data;
        self.state = stateEnum.resolved;

        delayfn(() => {
            thenCbArr.forEach((v) => {
                finishState(v, self.dataResolved);
            })
        })
    }
    function rejectFn(err) {
        if (self.state !== stateEnum.pending) {
            return;
        }
        self.dataRejected = err;
        self.state = stateEnum.rejected;

        delayfn(() => {
            errCbArr.forEach((v) => {
                finishState(v, self.dataRejected);
            })
        })
    }

    this.state = stateEnum.pending;

    let thenCbArr = [];
    let errCbArr = [];

    this.then = (fn1, fn2) => {
        if (isfn(fn1) === false && isfn(fn2) === false) {
            return self;
        }

        if (self.state === stateEnum.resolved) {
            const recentPromise = new myPromise((resolve, reject) => {
                if (isfn(fn1) === true) {
                    delayfn(() => {
                        finishState({
                            fn: fn1,
                            resolve,
                            reject,
                            recentPromise
                        }, self.dataResolved)
                    })
                } else {
                    resolve(self.dataResolved);
                }
            })
            return recentPromise;
        }

        if (self.state === stateEnum.rejected) {
            const recentPromise = new myPromise((resolve, reject) => {
                if (isfn(fn2) === true) {
                    delayfn(() => {
                        finishState({
                            fn: fn2,
                            resolve,
                            reject,
                            recentPromise
                        }, self.dataRejected)
                    })
                } else {
                    reject(self.dataRejected);
                }
            })
            return recentPromise;
        }

        return new myPromise((resolve, reject) => {
            if (isfn(fn1)) {
                thenCbArr.push(({
                    fn: fn1,
                    resolve,
                    reject
                }))
            }

            if (isfn(fn2)) {
                errCbArr.push(({
                    fn: fn2,
                    resolve,
                    reject
                }))
            }
        })
    }

    initFn(resolveFn, rejectFn);
}


module.exports = myPromise;
