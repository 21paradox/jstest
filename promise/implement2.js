function hasOwn(obj, prop) {
    return hasOwnProperty.call(obj, prop);
}

function isPromiseLike(obj) {
    if (obj && hasOwn(obj, 'then') ) {
        const objSafe = Object.getOwnPropertyDescriptors(obj);
        if (objSafe.then.get) {
            return isfn(objSafe.then.get)
        }
        return isfn(objSafe.then.value);
    }
    return false
}

function isfn(fn) {
    return typeof fn === 'function'
}

function delayfn(cb) {
    setTimeout(() => {
        cb()
    }, 0)
}

const stateEnum = {
    resolved: 'resolved',
    pending: 'pending',
    rejected: 'rejected'
}

function myPromise(initFn) {
    var self = this;
    self._data = undefined
    const thenCb = []
    const errCb = []
    self.state = stateEnum.pending

    function resolveFn(data) {
        if (self.state !== stateEnum.pending) {
            return;
        }

        if (isPromiseLike(data)) {
            let called = false;
            try {
                data.then((data1) => {
                    if (called) {
                        return self._data
                    }
                    called = true;
                    resolveFn(data1)
                }, (err1) => {
                    if (called) {
                        return self._data
                    }
                    called = true;
                    rejectFn(err1)
                })
            } catch (e) {
                if (!called) {
                    rejectFn(e)
                }
            }
            return;
        }
        self._data = data;
        self.state = stateEnum.resolved

        thenCb.forEach((fn) => {
            fn(data);
        })
    }

    function rejectFn(err) {
        if (self.state !== stateEnum.pending) {
            return;
        }
        self._data = err;
        self.state = stateEnum.rejected

        errCb.forEach((fn) => {
            fn(err);
        })
    }

    this.then = (fn1, fn2) => {
        if (!isfn(fn1) && !isfn(fn2)) {
            return self;
        }

        if (self.state === stateEnum.resolved) {
            const retPromise = new myPromise((resolve, reject) => {
                if (isfn(fn1)) {
                    delayfn(() => {
                        try {
                            const toResolve = fn1(self._data);
                            if (toResolve === retPromise) {
                                reject(new TypeError('asdada'))
                            } else {
                                resolve(toResolve)
                            }
                        } catch (e) {
                            reject(e)
                        }
                    })
                } else {
                    resolve(self._data);
                }
            })
            return retPromise;
        } else if (self.state === stateEnum.rejected) {
            const retPromise = new myPromise((resolve, reject) => {
                if (isfn(fn2)) {
                    delayfn(() => {
                        try {
                            const toResolve = fn2(self._data);
                            if (toResolve === retPromise) {
                                reject(new TypeError('asdada'))
                            } else {
                                resolve(toResolve);
                            }
                        } catch (e) {
                            reject(e)
                        }
                    });
                } else {
                    reject(self._data);
                }
            })
            return retPromise;
        }

        return new myPromise((resolve, reject) => {
            if (isfn(fn1)) {
                const cb = (data) => {
                    delayfn(() => {
                        try {
                            resolve(fn1(data));
                        } catch (e) {
                            reject(e)
                        }
                    })
                }
                thenCb.push(cb)
            }

            if (isfn(fn2)) {
                const cb = (err) => {
                    delayfn(() => {
                        try {
                            resolve(fn2(err));
                        } catch (e) {
                            reject(e)
                        }
                    })
                }
                errCb.push(cb)
            }
        })
    }
    initFn(resolveFn, rejectFn);
}


module.exports = myPromise;