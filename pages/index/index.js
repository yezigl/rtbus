//index.js
//获取应用实例
const app = getApp()
var amap = require('../../libs/amap-wx.js');

Page({
    data: {
        apiUrl: 'https://1e10.cn',

        config: {},

        cities: [],
        cityIndex: 0,
        cityTips: '',
        cityCode: '010',

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

    onLoad: function(options) {
        if (options.scene) {
            var scenes = options.scene.split('_');
            if (scenes.length >= 2) {
                wx.navigateTo({
                    url: '/pages/' + scenes[1] + '/index',
                })
            }
        }

        var that = this;
        wx.getSystemInfo({
            success: function(res) {
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
            favorList: wx.getStorageSync('favorList') || [],
            cityCode: wx.getStorageSync('cityCode') || '010',
        });
        this.checkVersion();
        this.getConfig();
        this.getOpenCity();
        this.getNearby();
        this.setCityIndex();
    },
    onShareAppMessage(res) {
        return {
            title: '实时公交查询',
            path: '/pages/index/index'
        }
    },

    mockEvent: function(value) {
        return {
            detail: {
                value: value
            }
        }
    },
    checkVersion: function() {
        var version = 2;
        var oldVersion = wx.getStorageSync('version') || 1;
        if (version > oldVersion) {
            this.setData({
                cityCode: this.data.cities[this.data.cityIndex].code
            });
            wx.setStorageSync('version', 2);
        }
        var cityCode = wx.getStorageSync('cityCode');
        var cityIndex = wx.getStorageSync('cityIndex');
        if (!cityCode && !cityIndex) {
            wx.removeStorageSync('favorList');
        }
    },
    //事件处理函数
    changeCity: function(e) {
        var value = e.detail.value;
        var city = this.data.cities[value];
        this.setData({
            cityCode: city.code,
            cityTips: city.tips,
            line: '',
            step: 0,
        });
        this.setCityIndex();
        this.resetAll();
        this.getCityLines(city.code);
        wx.setStorageSync('cityCode', city.code);
    },
    directionFocus: function(e) {
        this.setData({
            directionDisable: true,
            step: 1,
        });
    },
    searchLine: function(e) {
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
    searchChoose: function(e) {
        var line = e.currentTarget.dataset.line;
        this.setData({
            line: line,
            searchList: [],
        });
        this.getDirection(this.mockEvent(line));
    },
    changeDirection: function(e) {
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
    changeStation: function(e) {
        this.setData({
            stationIndex: e.detail.value,
            stationClass: e.detail.value == 0 ? 'muted' : '',
            step: 3,
        })
    },
    changeNearby: function(e) {
        this.setData({
            line: this.data.nearbyStations[e.detail.value]
        });
        this.getDirection(this.mockEvent(this.data.nearbyStations[e.detail.value]));
    },

    resetAll: function() {
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
    setCityIndex: function() {
        this.data.cities.forEach((v, i) => {
            if (v.code == this.data.cityCode) {
                this.setData({
                    cityIndex: i
                });
            }
        });
    },
    showTip: function() {
        wx.showModal({
            content: this.data.cityTips,
            showCancel: false,
        });
    },
    showMessage: function(data) {
        wx.showToast({
            'title': data.message || data,
            'icon': 'none',
            'duration': 2000
        });
    },
    hideSearch: function() {
        this.setData({
            searchList: []
        });
    },
    loadingData: function() {
        this.isRequest = 1;
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
    },
    loadingDone: function() {
        this.isRequest = 0;
        wx.hideLoading();
    },

    getCity: function(cities) {
        if (cities && cities.length > 0) {
            return cities.filter(e => e.code == this.data.cityCode)[0];
        }
        var cs = this.data.cities.filter(e => e.code == this.data.cityCode);
        return cs.length > 0 ? cs[0] : {'code': '010', 'name': '北京'};
    },
    getConfig: function() {
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/config',
            method: 'GET',
            success: function (ret) {
                that.setData({
                    config: ret.data.data
                });
            }
        })
    },
    getOpenCity: function() {
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/city',
            method: 'GET',
            success: function(ret) {
                that.setData({
                    cities: ret.data.data,
                    cityTips: that.getCity(ret.data.data).tips,
                });
                wx.setStorageSync('cities', ret.data.data);
                that.getCityLines(that.data.cityCode);
            }
        })
    },
    getCityLines: function(cityCode) {
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/lines',
            method: 'GET',
            data: {
                'cityCode': cityCode,
            },
            success: function(ret) {
                var lines = ret.data.data || [];
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
                for (var j = 0; j < (data.poisData.length || []) && j < 2; j++) {
                    var poiData = data.poisData[j];
                    var address = poiData.address;
                    var ss = address.split(';');
                    for (var i = 0; i < ss.length; i++) {
                        var line = ss[i].replace(/路|高峰/g, '');
                        if (line.indexOf('/') > 0) {
                            line = line.split('/')[0];
                        }
                        if (that.data.cityCode == '010') {
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
    getDirection: function(e, cb) {
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
                'cityCode': this.data.cityCode,
                'line': line,
            },
            success: function(ret) {
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
                that.resetAll();
                if (cb) {
                    cb();
                }
            },
            fail: function() {
                that.loadingDone();
                that.showMessage('查询失败，请稍后重试');
            }
        });
    },
    getStation: function() {
        this.loadingData();
        var that = this;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/station',
            method: 'GET',
            data: {
                'cityCode': this.data.cityCode,
                'line': this.data.line,
                'direction': this.data.directions[this.data.directionIndex].value,
            },
            success: function(ret) {
                that.loadingDone();
                if (ret.data.code != 0) {
                    that.showMessage(ret.data);
                    return;
                }
                that.setData({
                    stations: ret.data.data,
                });

                if (that.data.favorFlag) {
                    that.getStatus();
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
                that.loadingDone();
                that.showMessage('查询失败，请稍后重试');
            }
        })
    },
    getStatus: function() {
        if (this.data.stationIndex == 0) {
            this.showMessage('请选择站点')
            return;
        }
        this.loadingData();
        var that = this;
        var scrollLeft = ((this.data.stationIndex - 7) * 2 * 40) / this.data.pixelRatio;
        wx.request({
            url: that.data.apiUrl + '/api/rtbus/status',
            method: 'GET',
            data: {
                'cityCode': that.data.cityCode,
                'line': that.data.line,
                'direction': that.data.directions[that.data.directionIndex].value,
                'station': that.data.stations[that.data.stationIndex].value,
            },
            success: function(ret) {
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

                that.addFavor();
            },
            fail: function() {
                that.loadingDone();
                that.showMessage('查询失败，请稍后重试');
            }
        })
    },
    addFavor: function() {
        this.setData({
            favorFlag: false,
        });
        var name = this.data.line + '(' + this.data.directions[this.data.directionIndex].name + ')';
        var favorList = wx.getStorageSync('favorList') || [];
        for (var i = 0; i < favorList.length; i++) {
            var favor = favorList[i];
            if (favor.name == name) {
                return;
            }
        }
        var favor = {
            cityCode: this.data.cityCode,
            line: this.data.line,
            directionIndex: this.data.directionIndex,
            stationIndex: this.data.stationIndex,
            name: name,
        };
        favorList.unshift(favor);
        while (favorList.length > 2) {
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
            cityCode: favor.cityCode || that.data.cities[favor.cityIndex].code,
            line: favor.line,
            favorFlag: true,
        });
        that.setCityIndex();
        that.getDirection(that.mockEvent(favor.line), function() {
            that.changeDirection(that.mockEvent(favor.directionIndex));
            that.changeStation(that.mockEvent(favor.stationIndex));
        });
    }
})