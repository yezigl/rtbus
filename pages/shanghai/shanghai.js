// pages/shanghai/shanghai.js
//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        apiUrl: 'https://1e10.cn',

        cities: [],
        cityIndex: 0,
        cityTips: '',

        directions: [{
            name: '请选择行车方向',
            value: ''
        }],
        directionIndex: 0,

        stations: [{
            name: '请选择上车站',
            value: ''
        }],
        stationIndex: 0,

        line: '',

        directionClass: 'muted',
        stationClass: 'muted',
        directionDisable: true,

        busStatus: {},
        scrollLeft: 0,
        pixelRatio: 2,

        nearbyStations: [],
        nearbyStation: '',

        statusClass: 'status-ad',

        favorList: [],
        favorFlag: false,

        step: 0,
        lines: [],
        searchFlag: false,
        searchList: [],
        searchStr: '',
    },

    onLoad: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    pixelRatio: 2 * 375 / res.screenWidth
                });
            },
        })
        var cities = [{
            "code": "010",
            "name": "北京"
        }];
        this.setData({
            cities: wx.getStorageSync('cities') || cities,
            lines: wx.getStorageSync('lines') || [],
            cityIndex: wx.getStorageSync('cityIndex') || 0,
            favorList: wx.getStorageSync('favorList') || [],
        });
        this.getOpenCity();
    },

    mockEvent: function (value) {
        return {
            detail: {
                value: value
            }
        }
    },
    //事件处理函数
    changeCity: function (e) {
        var value = e.detail.value;
        var that = this;
        this.setData({
            cityIndex: value,
            line: '',
            cityTips: that.data.cities[value].tips,
            step: 0,
        });
        this.reset();
        this.getCityLines(this.getCityCode());
        wx.setStorageSync('cityIndex', value);
    },
    directionFocus: function (e) {
        this.setData({
            directionDisable: true,
            step: 1,
        });
    },
    searchLine: function (e) {
        var input = e.detail.value;
        if (input) {
            var p = new RegExp(',' + input + '.*?;', 'gi');
            var searchArr = this.data.searchStr.match(p);
            this.setData({
                searchList: searchArr ? searchArr.map(e => e.replace(/[,;]/g, '')) : []
            });
        } else {
            this.setData({
                searchList: []
            });
        }
    },
    searchChoose: function (e) {
        var line = e.currentTarget.dataset.line;
        this.setData({
            line: line,
            searchList: [],
        });
        this.getDirection(this.mockEvent(line));
    },
    changeDirection: function (e) {
        this.setData({
            directionIndex: e.detail.value,
            directionClass: e.detail.value == 0 ? 'muted' : '',
            step: 2,
        });
        this.resetStatus();
        this.changeStation(this.mockEvent(0));
        if (e.detail.value != 0) {
            this.getStation();
        }
    },
    changeStation: function (e) {
        this.setData({
            stationIndex: e.detail.value,
            stationClass: e.detail.value == 0 ? 'muted' : '',
            step: 3,
        })
    },
    changeNearby: function (e) {
        this.setData({
            line: this.data.nearbyStations[e.detail.value]
        });
        this.getDirection(this.mockEvent(this.data.nearbyStations[e.detail.value]));
    },

    reset: function () {
        this.setData({
            directionIndex: 0,
            directionClass: 'muted',
            stationIndex: 0,
            stationClass: 'muted',
            stations: [{
                name: '请选择上车站',
                value: ''
            }],
        });
        this.resetStatus();
    },
    resetStatus: function () {
        this.setData({
            busStatus: {},
            scrollLeft: 0,
            statusClass: 'status-ad',
        });
    },
    showTip: function () {
        wx.showModal({
            content: this.data.cityTips,
            showCancel: false,
        });
    },
    showMessage: function (data) {
        wx.showToast({
            'title': data.message || data,
            'icon': 'none',
            'duration': 2000
        });
    },
    hideSearch: function () {
        this.setData({
            searchList: []
        });
    },
    loadingData: function () {
        this.isRequest = 1;
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
    },
    loadingDone: function () {
        this.isRequest = 0;
        wx.hideLoading();
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
                    cities: ret.data.data,
                    cityTips: ret.data.data[that.data.cityIndex].tips,
                });
                wx.setStorageSync('cities', ret.data.data);
                that.getCityLines(that.getCityCode());
            }
        })
    },
    getCityLines: function (cityCode) {
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/lines',
            method: 'GET',
            data: {
                'cityCode': cityCode,
            },
            success: function (ret) {
                var lines = ret.data.data;
                if (lines.length > 0) {
                    that.setData({
                        lines: lines,
                        searchStr: lines.map(e => ',' + e.id + ';').reduce((a, b) => a + b),
                        searchFlag: true,
                    });
                } else {
                    that.setData({
                        lines: [],
                        searchStr: '',
                        searchFlag: false,
                    });
                }
                wx.setStorageSync('lines', lines);
            }
        })
    },
    getDirection: function (e, cb) {
        var line = e.detail.value;
        if (this.isRequest == 1 || !line) {
            return;
        }
        this.hideSearch();
        this.loadingData();

        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/direction',
            method: 'GET',
            data: {
                'cityCode': this.getCityCode(),
                'line': line,
            },
            success: function (ret) {
                that.loadingDone();
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    return;
                }
                that.setData({
                    line: line,
                    directions: ret.data.data,
                    directionDisable: false,
                });
                that.reset();
                if (cb) {
                    cb();
                }
            },
            fail: function () {
                that.loadingDone();
                that.showMessage('查询失败，请稍后重试');
            }
        });
    },
    getStation: function () {
        this.loadingData();
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
                that.loadingDone();
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    return;
                }
                that.setData({
                    stations: ret.data.data,
                });
            },
            fail: function () {
                that.loadingDone();
                that.showMessage('查询失败，请稍后重试');
            }
        })
    },
    getStatus: function () {
        if (this.data.stationIndex == 0) {
            return;
        }
        this.loadingData();
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
                that.loadingDone();
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    return;
                }
                that.setData({
                    busStatus: ret.data.data,
                    scrollLeft: scrollLeft < 0 ? 0 : scrollLeft,
                    statusClass: 'status',
                });
            },
            fail: function () {
                that.loadingDone();
                that.showMessage('查询失败，请稍后重试');
            }
        })
    }
})