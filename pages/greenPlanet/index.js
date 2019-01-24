// pages/greenPlanet/index.js

var utils = require("../utils/utils.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        qas: [
            {
                order: 1,
                question: '2018年，你上班经常选择的出行方式为？',
                answers: [
                    { code: 0, name: '步行', value: 0.01 },
                    { code: 1, name: '自行车', value: 0.01 },
                    { code: 2, name: '地铁/公交', value: 3 },
                    { code: 3, name: '电动车/摩托', value: 1.5 },
                    { code: 4, name: '私家车/出租车', value: 450 },
                    { code: 5, name: '不上班', value: 0 },
                ]
            },
            {
                order: 2,
                question: '2018年，你平均一周上班几天？',
                answers: [
                    { code: 0, name: '1', value: 1 },
                    { code: 1, name: '2', value: 2 },
                    { code: 2, name: '3', value: 3 },
                    { code: 3, name: '4', value: 4 },
                    { code: 4, name: '5', value: 5 },
                    { code: 5, name: '6', value: 6 },
                    { code: 6, name: '7', value: 7 },
                ]
            },
            {
                order: 3,
                question: '每天上班路上，花费的时间大约是？',
                answers: [
                    { code: 0, name: '30分钟以内', value: 15 },
                    { code: 1, name: '30-60分钟', value: 45 },
                    { code: 2, name: '60-90分钟', value: 75 },
                    { code: 3, name: '90分钟以上', value: 120 },
                ]
            }
        ],
        gps: [
            {
                title: '绿光大长腿',
                description: ['2018年，上班路漫漫', '你习惯步行出行，出门全靠逆天大长腿', '走出春风十里，片片绿意'],
                carbon: '',
                star: 5,
                image: 'https://www.1e10.cn/images/gp_zoulu.svg',
                share: 'https://www.1e10.cn/images/share_zoulu.png',
                sharebg: 'https://www.1e10.cn/images/sharebg_zoulu.png',
            },
            {
                title: '高速飞毛腿',
                description: ['2018年，上班路漫漫', '你习惯自行车出行，出门全靠脚速', '吾入骑途，骑乐无穷'],
                carbon: '',
                star: 4,
                image: 'https://www.1e10.cn/images/gp_zixingche.svg',
                share: 'https://www.1e10.cn/images/share_zixingche.png',
                sharebg: 'https://www.1e10.cn/images/sharebg_zixingche.png',
            },
            {
                title: '辛勤老司机',
                description: ['2018年，上班路漫漫', '你习惯公交/地铁出行，在无数个等待车来的日子里', '积累的绿植灌溉了一颗又一颗的树苗'],
                carbon: '',
                star: 3,
                image: 'https://www.1e10.cn/images/gp_gongjiao.svg',
                share: 'https://www.1e10.cn/images/share_gongjiao.png',
                sharebg: 'https://www.1e10.cn/images/sharebg_gongjiao.png',
            },
            {
                title: '自在无影腿',
                description: ['2018年，上班路漫漫', '你习惯电动车/摩托车出行，潇洒不留尘', '事了拂衣去，深藏身与名'],
                carbon: '',
                star: 3,
                image: 'https://www.1e10.cn/images/gp_diandongche.svg',
                share: 'https://www.1e10.cn/images/share_diandongche.png',
                sharebg: 'https://www.1e10.cn/images/sharebg_diandongche.png',
            },
            {
                title: '绿芽小鲜肉',
                description: ['2018年，上班路漫漫', '你习惯开车出行，千里车流，万里人潮', '积累的绿值助力小绿芽萌发，即使力量微薄，也要加油鸭'],
                carbon: '123g',
                star: 1,
                image: 'https://www.1e10.cn/images/gp_qiche.svg',
                share: 'https://www.1e10.cn/images/share_qiche.png',
                sharebg: 'https://www.1e10.cn/images/sharebg_qiche.png',
            },
            {
                title: '壕无人性',
                description: ['2018年，上班路漫漫', '你习惯……', '不好意思打扰了，你不需要上班'],
                carbon: '',
                star: 5,
                image: 'https://www.1e10.cn/images/gp_bushangban.svg',
                share: 'https://www.1e10.cn/images/share_bushangban.png',
                sharebg: 'https://www.1e10.cn/images/sharebg_bushangban.png',
            },
        ],
        section: 0,
        step: 0,
        percent: 0,
        qa: {},
        gp: {},
        mask: false,

        answers: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // this.selectQA(this.data.step);
        // this.doneQA()
    },

    doQA: function(e) {
        this.selectQA(this.data.step);
    },
    selectQA: function(step) {
        var qa = this.data.qas[step];
        if (this.data.answers.length > step) {
            qa.answers[this.data.answers[step]]['checked'] = true;
        }
        this.setData({
            section: 1,
            qa: qa,
            percent: step * 33.33,
        });
        
    },
    preQA: function() {
        this.setData({
            step: this.data.step - 1
        })
        this.selectQA(this.data.step);
    },
    nextQA: function() {
        if (this.data.answers.length <= this.data.step) {
            utils.showToast('请选择答案');
            return;
        }
        var qa = this.data.qas[this.data.step];
        if (this.data.step == 0 && qa.answers[this.data.answers[this.data.step]].value == 0) {
            this.data.answers[0] = this.data.answers[0];
            this.data.answers[1] = 0;
            this.data.answers[2] = 0;
            this.doneQA();
            return;
        }
        this.setData({
            step: this.data.step + 1
        })
        this.selectQA(this.data.step);
    },
    selectAnswer: function(e) {
        var value = e.detail.value;
        var qa = this.data.qas[this.data.step];
        qa.answers.forEach(e => e.checked = false);
        qa.answers[value].checked = true;
        this.data.answers[this.data.step] = value;
        this.setData({
            qa: qa
        })
    },

    doneQA: function() {
        var ans1 = this.data.qas[0].answers[this.data.answers[0]];
        var ans2 = this.data.qas[1].answers[this.data.answers[1]];
        var ans3 = this.data.qas[2].answers[this.data.answers[2]];
        var value = ans1.value * ans2.value * ans3.value * 52 / 10000;
        var gp = this.data.gps[ans1.code];
        if (value < 0.1) {
            gp.carbon = '一丢丢';
        } else {
            gp.carbon = (value > 100 ? value.toFixed(0) : value.toFixed(1)) + 'kg';
        }
        this.setData({
            section: 2,
            gp: gp,
            mask: true,
        });
        var that = this;
        setTimeout(function() {
            that.setData({
                mask: false
            });
        }, 1000);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '绿色星球',
            path: '/pages/greenPlanet/index',
            imageUrl: this.data.gp.share
        }
    },

    shareToAblum: function(e) {
        wx.navigateTo({
            url: '/pages/greenPlanet/share?gp=' + JSON.stringify(this.data.gp),
        })
    }
})