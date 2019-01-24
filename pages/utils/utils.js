module.exports = {
    mockEvent: function(value) {
        return {
            detail: {
                value: value
            }
        }
    },
    showToast: function(data) {
        wx.showToast({
            'title': data.message || data,
            'icon': 'none',
            'duration': 2000
        });
    },
    showModal: function(msg) {
        wx.showModal({
            content: msg,
            showCancel: false,
        });
    },
    promisify: function(fn) {
        return function(obj = {}) {
            return new Promise((resolve, reject) => {
                obj.success = function(res) {
                    resolve(res)
                }

                obj.fail = function(res) {
                    reject(res)
                }

                fn(obj)
            })
        }
    }

};