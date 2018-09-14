//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        apiUrl: 'https://1e10.cn',

        cities: [''],
        cityIndex: 0,
        directions: [{ name: '请选择行车方向', value: '' }],
        directionIndex: 0,
        stations: [{ name: '请选择上车站', value: '' }],
        stationIndex: 0,

        line: '',

        directionClass: 'muted',
        stationClass: 'muted',

        busStatus: {},
        scrollLeft: 0,
        pixelRatio: 2,
    },
    //事件处理函数
    changeCity: function (e) {
        console.log(e);
        this.setData({
            cityIndex: e.detail.value
        });
    },
    changeDirection: function (e) {
        this.setData({
            directionIndex: e.detail.value,
            directionClass: e.detail.value == 0 ? 'muted' : '',
            stationIndex: 0,
            busStatus: {},
        });
        if (e.detail.value != 0) {
            this.getStation();
        }
    },
    changeStation: function (e) {
        this.setData({
            stationIndex: e.detail.value,
            stationClass: e.detail.value == 0 ? 'muted' : '',
        })
    },
    reset: function () {
        this.setData({
            directionIndex: 0,
            directionClass: 'muted',
            stationIndex: 0,
            stationClass: 'muted',
            stations: [{ name: '请选择上车站', value: '' }],
            busStatus: {},
            scrollLeft: 0,
        });
    },
    showTip: function () {
        wx.showModal({
            content: '1、请输入完整的线路名称，如“专101”、“46路区间”。\n2、本服务提供的信息仅供参考，如有不符，敬请谅解。\n3、数据来源于各地公交公司和交通委。',
            showCancel: false,
        });
    },

    onLoad: function () {
        this.getOpenCity();
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    pixelRatio: res.pixelRatio
                });
            },
        })
    },


    getCityCode: function () {
        return this.data.cities[this.data.cityIndex].code;
    },
    getOpenCity: function () {
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/city',
            method: 'GET',
            success: function (ret) {
                that.setData({
                    cities: ret.data.data
                });
            }
        })
    },
    getDirection: function (e) {
        var line = e.detail.value;
        if (this.isRequest == 1 || !line) {
            return;
        }
        this.isRequest = 1;
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/direction',
            method: 'GET',
            data: {
                'cityCode': this.getCityCode(),
                'line': line,
            },
            success: function (ret) {
                that.setData({
                    line: line,
                    directions: ret.data.data,
                });
                that.reset();
                wx.hideLoading();
                that.isRequest = 0;
            }
        });
    },
    getStation: function () {
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/station',
            method: 'GET',
            data: {
                'cityCode': this.getCityCode(),
                'line': this.data.line,
                'direction': this.data.directions[this.data.directionIndex].value,
            },
            success: function (ret) {
                that.setData({
                    stations: ret.data.data
                });
                wx.hideLoading();
            }
        })
    },
    getStatus: function () {
        if (this.data.stationIndex == 0) {
            return;
        }
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
        var that = this;
        var scrollLeft = ((this.data.stationIndex - 3) * 2 * 100 - 100) / this.data.pixelRatio;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/status',
            method: 'GET',
            data: {
                'cityCode': this.getCityCode(),
                'line': this.data.line,
                'direction': this.data.directions[this.data.directionIndex].value,
                'station': this.data.stations[this.data.stationIndex].value,
            },
            success: function (ret) {
                that.setData({
                    busStatus: ret.data.data,
                    scrollLeft: scrollLeft < 0 ? 0 : scrollLeft,
                });
                wx.hideLoading();
            }
        })
    }
})
