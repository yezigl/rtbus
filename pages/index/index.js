//index.js
//获取应用实例
const app = getApp()
var amap = require('../../libs/amap-wx.js');

Page({
    data: {
        apiUrl: 'https://1e10.cn',

        cities: [{
            "code": "010",
            "name": "北京",
            "tips": "1、请输入线路，如“636”、“专101”、“特11”、“特8内”、“300内”、“300快外”。\n2、数据来源于北京公交公司，仅供参考，如有不符，敬请谅解。"
        }],
        cityIndex: 0,
        cityTips: '1、请输入线路，如“636”、“专101”、“特11”、“特8内”、“300内”、“300快外”。\n2、数据来源于北京公交公司，仅供参考，如有不符，敬请谅解。',

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
    },

    onLoad: function() {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    pixelRatio: res.pixelRatio
                });
            },
        })
        this.getNearby();
        this.setData({
            cityIndex: wx.getStorageSync('cityIndex') || 0,
            favorList: wx.getStorageSync('favorList') || [],
        });
        this.getOpenCity();
    },

    //事件处理函数
    changeCity: function(e) {
        var value = e.detail.value;
        var that = this;
        this.setData({
            cityIndex: value,
            line: '',
            cityTips: that.data.cities[value].tips,
        });
        this.reset();
        wx.setStorageSync('cityIndex', value);
    },
    changeDirection: function(e) {
        this.setData({
            directionIndex: e.detail.value,
            directionClass: e.detail.value == 0 ? 'muted' : '',
        });
        this.resetStatus();
        this.changeStation({
            detail: {
                value: 0
            }
        });
        if (e.detail.value != 0) {
            this.getStation();
        }
    },
    changeStation: function(e) {
        this.setData({
            stationIndex: e.detail.value,
            stationClass: e.detail.value == 0 ? 'muted' : '',
        })
    },
    changeNearby: function(e) {
        this.setData({
            line: this.data.nearbyStations[e.detail.value]
        });
        this.getDirection({
            detail: {
                value: this.data.nearbyStations[e.detail.value]
            }
        });
    },

    reset: function() {
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
    resetStatus: function() {
        this.setData({
            busStatus: {},
            scrollLeft: 0,
            statusClass: 'status-ad',
        });
    },
    showTip: function() {
        wx.showModal({
            content: this.data.cityTips,
            showCancel: false,
        });
    },
    showMessage: function(data) {
        wx.hideLoading();
        wx.showToast({
            'title': data.message,
            'icon': 'none',
            'duration': 2000
        });
    },

    getCityCode: function() {
        return this.data.cities[this.data.cityIndex].code;
    },
    getOpenCity: function() {
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/city',
            method: 'GET',
            success: function(ret) {
                that.setData({
                    cities: ret.data.data,
                    cityTips: ret.data.data[that.data.cityIndex].tips,
                });
            }
        })
    },
    getNearby: function() {
        var that = this;
        var wxamap = new amap.AMapWX({
            key: 'd681595fb1acd11bd900ad2bac9b026d'
        });
        wxamap.getPoiAround({
            querykeywords: '公交',
            querytypes: '150700',
            success: function(data) {
                var stmap = {};
                var nst = '';
                for (var j = 0; j < data.poisData.length && j < 2; j++) {
                    var poiData = data.poisData[j];
                    var address = poiData.address;
                    var ss = address.split(';');
                    for (var i = 0; i < ss.length; i++) {
                        var line = ss[i].replace(/路|高峰/g, '');
                        if (line.indexOf('/') > 0) {
                            line = line.split('/')[0];
                        }
                        if (that.data.cityIndex == 0) {
                            if (/^(\w+|专|夜|快|运)?\d+(快|(快?(内|外))|通勤快车)?/.test(line) && line.indexOf('区间') < 0) {
                                stmap[line] = j;
                            }
                        } else if (line.indexOf('停运') < 0 && line.indexOf('区间') < 0) {
                            stmap[line] = j;
                        }
                    }
                    if (j == 0) {
                        nst = poiData.name.replace('(公交站)', '');
                    }
                }
                var sts = [];
                for (var key in stmap) {
                    sts.push(key);
                }
                if (sts.length > 0) {
                    that.setData({
                        nearbyStations: sts,
                        nearbyStation: nst
                    });
                }
            },
            fail: function(info) {
                console.log(info);
            }
        })
    },
    directionFocus: function(e) {
        this.setData({
            directionDisable: true
        });
    },
    getDirection: function(e, cb) {
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
            success: function(ret) {
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    that.isRequest = 0;
                    return;
                }
                that.setData({
                    line: line,
                    directions: ret.data.data,
                    directionDisable: false
                });
                that.reset();
                wx.hideLoading();
                that.isRequest = 0;
                if (cb) {
                    cb();
                }
            },
            fail: function() {
                that.showMessage({
                    message: '查询失败，请稍后重试'
                });
                that.isRequest = 0;
            }
        });
    },
    getStation: function() {
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
            success: function(ret) {
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    return;
                }
                that.setData({
                    stations: ret.data.data
                });
                wx.hideLoading();
                if (that.data.favorFlag) {
                    return;
                }
                // 判断当前的公交车站
                for (var i = 0; i < ret.data.data.length; i++) {
                    var st = ret.data.data[i];
                    if (that.data.nearbyStation.indexOf(st.name) >= 0) {
                        that.setData({
                            stationIndex: i,
                            stationClass: ''
                        });
                    }
                }
            },
            fail: function() {
                that.showMessage({
                    message: '查询失败，请稍后重试'
                });
            }
        })
    },
    getStatus: function() {
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
            success: function(ret) {
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    return;
                }
                that.setData({
                    busStatus: ret.data.data,
                    scrollLeft: scrollLeft < 0 ? 0 : scrollLeft,
                    statusClass: 'status',
                });
                wx.hideLoading();
                that.addFavor();
            },
            fail: function() {
                that.showMessage({
                    message: '查询失败，请稍后重试'
                });
            }
        })
    },
    addFavor: function() {
        this.setData({
            favorFlag: false,
        });
        var favorList = wx.getStorageSync('favorList') || [];
        for (var i = 0; i < favorList.length; i++) {
            var favor = favorList[i];
            if (favor.line == this.data.line) {
                return;
            }
        }
        var favor = {
            cityIndex: this.data.cityIndex,
            line: this.data.line,
            directionIndex: this.data.directionIndex,
            stationIndex: this.data.stationIndex,
        };
        favorList.unshift(favor);
        if (favorList.length > 3) {
            favorList.pop();
        }
        this.setData({
            favorList: favorList
        });
        wx.setStorageSync('favorList', favorList);
    },
    doFavor: function(e) {
        var that = this;
        var favor = e.currentTarget.dataset.favor;
        that.setData({
            cityIndex: favor.cityIndex,
            line: favor.line,
            favorFlag: true,
        });
        that.getDirection({
            detail: {
                value: favor.line
            }
        }, function() {
            that.changeDirection({
                detail: {
                    value: favor.directionIndex
                }
            });
            that.changeStation({
                detail: {
                    value: favor.stationIndex
                }
            });
        });
    }
})