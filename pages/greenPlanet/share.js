// pages/greenPlanet/share.js
var utils = require("../utils/utils.js");

const ctx = wx.createCanvasContext('shareCanvas');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        gp: {},
        font: '',
        tempFile: '',

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            gp: JSON.parse(options.gp)
        });
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                var font = 'Noto';
                if (res.system.indexOf('iOS') >= 0) {
                    font = 'PingFangSC';
                }
                that.setData({
                    font: font
                });
                setTimeout(function() {
                    that.drawShare(res.windowWidth);
                }, 1000)
                
            },
        })
    },

    drawShare: function(aw) {
        var gp = this.data.gp;
        var ratio = aw / 375;
        var w = 300 * ratio;
        var h = 483 * ratio;
        var that = this;
        var star = 'https://www.1e10.cn/images/gp-star.png';
        var qr = 'https://www.1e10.cn/images/qrcode.png';

        Promise.all([
            utils.promisify(wx.getImageInfo)({
                src: gp.sharebg
            }),
            utils.promisify(wx.getImageInfo)({
                src: star
            }),
            utils.promisify(wx.getImageInfo)({
                src: qr
            })
        ]).then(res => {
            ctx.drawImage(res[0].path, 0, 0, res[0].width, res[0].height, 0, 0, w, h);
            ctx.save();

            ctx.font = 'normal normal bold 36px ' + that.data.font;
            ctx.setTextAlign('center');
            ctx.setFillStyle('#380749');
            ctx.fillText(gp.title, w / 2, 65 * ratio);
            ctx.save();

            var dh = 95;
            var dmargin = 18;
            var dcolor = '#380749';
            ctx.font = 'normal normal bold 11px ' + that.data.font;
            ctx.setTextAlign('center');
            ctx.setFillStyle(dcolor);
            ctx.fillText(gp.description[0], w / 2, dh * ratio);
            ctx.save();

            ctx.setTextAlign('center');
            ctx.setFillStyle(dcolor)
            ctx.fillText(gp.description[1], w / 2, (dh + dmargin) * ratio);
            ctx.save();

            ctx.setTextAlign('center');
            ctx.setFillStyle(dcolor);
            ctx.fillText(gp.description[2], w / 2, (dh + dmargin * 2) * ratio);
            ctx.save();

            ctx.setTextAlign('left');
            ctx.setFillStyle(dcolor);
            ctx.fillText('碳排放量', 33 * ratio, (dh + dmargin * 3 + 5) * ratio);
            ctx.save();

            ctx.setTextAlign('left');
            ctx.setFillStyle(dcolor);
            ctx.fillText('交通绿值', 156 * ratio, (dh + dmargin * 3 + 5) * ratio);
            ctx.save();

            ctx.font = 'normal normal bold 20px ' + that.data.font;
            ctx.setTextAlign('left');
            ctx.setFillStyle('#FFF9C8');
            ctx.fillText(gp.carbon, 86 * ratio, (dh + dmargin * 3 + 5) * ratio);
            ctx.save();

            for (var i = 0; i < gp.star; i++) {
                ctx.drawImage(res[1].path, 0, 0, 42, 38, (208 + (15 * i)) * ratio, (dh + dmargin * 3 - 5) * ratio, 13, 12);
            }
            ctx.save();

            var qtw = 232;
            var qrw = qtw + 8;
            ctx.font = '10px ' + that.data.font;
            ctx.setTextAlign('right');
            ctx.setFillStyle('rgba(255, 249, 200, 0.6)');
            ctx.fillText('2018交通绿值图鉴', qtw * ratio, 445 * ratio);
            ctx.save();

            ctx.setTextAlign('right');
            ctx.setFillStyle('rgba(255, 249, 200, 0.6)');
            ctx.fillText('长按二维码识别查看', qtw * ratio, 460 * ratio);
            ctx.save();

            ctx.drawImage(res[2].path, 0, 0, res[2].width, res[2].height, qrw * ratio, 430 * ratio, 40, 40);
            ctx.save();

            that.doDraw();
        }).catch(err => {
            console.log(err)
            utils.showToast('生成图片失败');
        })

    },
    doDraw: function() {
        var that = this;
        ctx.draw(false, function () {
            wx.canvasToTempFilePath({
                canvasId: 'shareCanvas',
                destWidth: 750,
                destHeight: 1206,
                success(res) {
                    that.setData({
                        tempFile: res.tempFilePath
                    });
                }
            })
        });
    },
    saveShare: function(e) {
        if (!this.data.tempFile) {
            utils.showToast('生成图片失败');
            return;
        }
        wx.saveImageToPhotosAlbum({
            filePath: this.data.tempFile,
            success(res) {
                utils.showToast('保存成功，发个朋友圈吧 ^_^');
            },
            fail(err) {
                console.log(err)
            }
        })
    }
})