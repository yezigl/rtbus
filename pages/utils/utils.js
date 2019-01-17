
module.exports = {
    mockEvent: function (value) {
        return {
            detail: {
                value: value
            }
        }
    },
    showToast: function (data) {
        wx.showToast({
            'title': data.message || data,
            'icon': 'none',
            'duration': 2000
        });
    },
    showModal: function (msg) {
        wx.showModal({
            content: msg,
            showCancel: false,
        });
    },
};