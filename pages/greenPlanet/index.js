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
                    { code: 0, name: '步行' },
                    { code: 1, name: '自行车' },
                    { code: 2, name: '地铁/公交' },
                    { code: 3, name: '电动车/摩托' },
                    { code: 4, name: '私家车/出租车' },
                    { code: 5, name: '不上班' },
                ]
            },
            {
                order: 2,
                question: '2018年，你平均一周上班几天？',
                answers: [
                    { code: 0, name: '1' },
                    { code: 1, name: '2' },
                    { code: 2, name: '3' },
                    { code: 3, name: '4' },
                    { code: 4, name: '5' },
                    { code: 5, name: '6' },
                    { code: 6, name: '7' },
                ]
            },
            {
                order: 3,
                question: '每天上班路上，花费的时间大约是？',
                answers: [
                    { code: 0, name: '30分钟以内' },
                    { code: 1, name: '30-60分钟' },
                    { code: 2, name: '60-90分钟' },
                    { code: 3, name: '90分钟以上' },
                ]
            }
        ],
        gps: [
            {
                title: '辛勤老司机',
                description: ['2018年，上班路漫漫', '你习惯公交/地铁出行，在无数个等待车来的日子里', '积累的绿植灌溉了一颗又一颗的树苗'],
                carbon: '123g',
                green: '12345',
                star: 3,
            }
        ],
        section: 1,
        step: 0,
        percent: 0,
        qa: {},
        gp: {},

        answers: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.selectQA(this.data.step);
        // this.doneQA()
    },

    selectQA: function(step) {
        var qa = this.data.qas[step];
        if (this.data.answers.length > step) {
            qa.answers[this.data.answers[step]]['checked'] = true;
        }
        this.setData({
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
        this.setData({
            section: 2,
            gp: this.data.gps[0]
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '绿色星球',
            path: '/pages/greenPlanet/index'
        }
    }
})