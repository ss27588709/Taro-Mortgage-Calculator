/*
 * @Author: qiuz
 * @Github: <https://github.com/qiuziz>
 * @Date:  2020-12-10 23:41:04
 * @Last Modified by: qiuz
 */

import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, ScrollView } from "@tarojs/components";

import { AtTextarea, AtRadio } from "taro-ui";

import "./index.scss";
import { getGlobalData, getStorageData } from "@utils";
import { SafeAreaView, StatusBar } from "@components";
import { trim } from "lodash";
import { LunarUtil, Solar, LunarYear, Lunar, EightChar } from "lunar-typescript";


export default class BaziPaipan extends Component<any,
  any> {
  constructor(props: any) {
    super(props);
    this.state = {
      date: "",
      sex: "",
      dateError: false,
      lunarCheck: '',
      baZiShiShen: [],
      daYun:[]
    };
  }


  async componentDidMount() {
    // const params = getGlobalData("COMPUTE_RESULT") || {};
    // this.init(params);
    // const { type = "equalInterest" } =
    //   (await getStorageData("USER_LOAN_WAY")) || {};
    // this.setState({
    //   checked: type
    // });
  }



  handleDateChange = (value) => {
    this.setState({ date: value });
    this.validateDate(value);
  }
  handleSexChange = (value) => {
    this.setState({ sex: value });
  }
  validateDate = (v) => {
    if (!/^\s*\d{4}\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}\s*[+-]+$/.test(v)) {
      this.setState({ error: true });
      return;
    }
    const isLunar = /\s{3}/.test(v);
    this.setState({
      error: false,
    });
    this.compute(v, isLunar);

  }
  compute = (date: string, isLunar: boolean) => {
    var v = trim(date);
    if (isLunar) {
      var year = parseInt(v.substr(0, 4));
      v = v.substr(4);
      var leapMonth = false;
      if (v.indexOf(' ') == 0) {
        leapMonth = true;
      }
      v = trim(v);
      var month = parseInt(v.substr(0, 2), 10);
      if (leapMonth) {
        if (LunarYear.fromYear(year).getLeapMonth() == month) {
          month = -month;
        }
      }

      v = trim(v.substr(2));
      var day = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var hour = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var minute = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var gender = -1;
      if ('+' == v) {
        gender = 1;
      } else if ('-' == v) {
        gender = 0;
      }
      if (year < 1 || year > 9999) {
        return;
      }
      if (month >= 0 && (month < 1 || month > 12)) {
        return;
      }
      if (month < 0 && (month < -12 || month > -1)) {
        return;
      }
      if (day < 1 || day > 30) {
        return;
      }
      if (hour < 0 || hour > 23) {
        return;
      }
      if (minute < 0 || minute > 59) {
        return;
      }
      this.computeLunar(year, month, day, hour, minute, gender);
    } else {
      var year = parseInt(v.substr(0, 4));
      v = trim(v.substr(4));
      var month = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var day = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var hour = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var minute = parseInt(v.substr(0, 2), 10);
      v = trim(v.substr(2));
      var gender = -1;
      if ('+' == v) {
        gender = 1;
      } else if ('-' == v) {
        gender = 0;
      }
      if (year < 1 || year > 9999) {
        return;
      }
      if (month < 1 || month > 12) {
        return;
      }
      if (day < 1 || day > 31) {
        return;
      }
      if (hour < 0 || hour > 23) {
        return;
      }
      if (minute < 0 || minute > 59) {
        return;
      }
      this.computeSolar(year, month, day, hour, minute, gender);
    }
  }

  computeLunar = (year: number, month: number, day: number, hour: number, minute: number, gender: number) => {
    var lunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
    var solar = lunar.getSolar();
    this.computeEightChar(lunar, solar, gender);
  }
  computeSolar = (year: number, month: number, day: number, hour: number, minute: number, gender: number) => {
    var solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    var lunar = solar.getLunar();
    this.computeEightChar(lunar, solar, gender);
  }

  getSelectedLunar(date: Date, gender: number, bazi: EightChar) {
    var currentYear = date.getFullYear();
    var yun = bazi.getYun(gender);
    var startYunSolar = yun.getStartSolar();
    var daYun = yun.getDaYun();
    var daYunSize = daYun.length;
    var currentLunar = Lunar.fromDate(date);

    var yZhi = currentLunar.getYearZhiByLiChun();
    console.log(LunarUtil.ZHI_HIDE_GAN);
    var yHideGan = LunarUtil.ZHI_HIDE_GAN.get(yZhi);
    var yShiShenZhi: any = [];
    for (var u = 0, v = yHideGan.length; u < v; u++) {
      yShiShenZhi.push(LunarUtil.SHI_SHEN_ZHI.get(bazi.getDayGan() + yZhi + yHideGan[u]));
    }

    var mZhi = currentLunar.getMonthZhi();
    var mHideGan = LunarUtil.ZHI_HIDE_GAN.get(mZhi);
    var mShiShenZhi: any = [];
    for (var u = 0, v = mHideGan.length; u < v; u++) {
      mShiShenZhi.push(LunarUtil.SHI_SHEN_ZHI.get(bazi.getDayGan() + mZhi + mHideGan[u]));
    }

    var rZhi = currentLunar.getDayZhi();
    var rHideGan = LunarUtil.ZHI_HIDE_GAN.get(rZhi);
    var rShiShenZhi: any = [];
    for (var u = 0, v = rHideGan.length; u < v; u++) {
      rShiShenZhi.push(LunarUtil.SHI_SHEN_ZHI.get(bazi.getDayGan() + rZhi + rHideGan[u]));
    }
    var currentYun = {
      daYunShiShen: '',
      daYunShiShenZhi: [],
      daYunHideGan: [],
      liuNianGanZhi: currentLunar.getYearInGanZhiByLiChun(),
      liuNianShiShen: LunarUtil.SHI_SHEN_GAN.get(bazi.getDayGan() + currentLunar.getYearGanByLiChun()),
      liuNianShiShenZhi: yShiShenZhi,
      liuNianHideGan: yHideGan,
      liuYueHideGan: mHideGan,
      liuRiHideGan: rHideGan,
      liuYueGanZhi: currentLunar.getMonthInGanZhi(),
      liuYueShiShen: LunarUtil.SHI_SHEN_GAN.get(bazi.getDayGan() + currentLunar.getMonthGan()),
      liuYueShiShenZhi: mShiShenZhi,
      liuRiGanZhi: currentLunar.getDayInGanZhi(),
      liuRiShiShen: LunarUtil.SHI_SHEN_GAN.get(bazi.getDayGan() + currentLunar.getDayGan()),
      liuRiShiShenZhi: rShiShenZhi,
      daYunGanZhi: ""
    };
    for (var i = 0; i < daYunSize; i++) {
      var d = daYun[i];
      if (d.getStartYear() <= currentYear && currentYear <= d.getEndYear()) {
        if (d.getGanZhi()) {
          currentYun.daYunGanZhi = d.getGanZhi();
          currentYun.daYunShiShen = LunarUtil.SHI_SHEN_GAN.get(bazi.getDayGan() + d.getGanZhi().substr(0, 1));
          var dZhi = d.getGanZhi().substr(1);
          var dHideGan = LunarUtil.ZHI_HIDE_GAN.get(dZhi);
          var dShiShenZhi: any = [];
          for (var x = 0, y = dHideGan.length; x < y; x++) {
            dShiShenZhi.push(LunarUtil.SHI_SHEN_ZHI.get(bazi.getDayGan() + dZhi + dHideGan[x]));
          }
          currentYun.daYunShiShenZhi = dShiShenZhi;
          currentYun.daYunHideGan = dHideGan as never[];
        }
        break;
      }
    }
    return { currentYun, startYunSolar, daYun, daYunSize, currentYear };
  }

  computeEightChar(lunar: Lunar, solar: Solar, gender: number) {
    var padding = function (n) {
      return (n < 10 ? '0' : '') + n;
    };
    var bazi = lunar.getEightChar();
    var date = new Date();
    var { currentYear, startYunSolar, daYun, daYunSize, currentYun } = this.getSelectedLunar(date, gender, bazi);


    var s: string = '<table><tbody>';
    s += '<tr>';
    s += '<td>出生：</td>';
    s += '<td colspan="10" class="left">' + solar.getYear() + '年' + solar.getMonth() + '月' + solar.getDay() + '日(' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese() + ')' + padding(solar.getHour()) + ':' + padding(solar.getMinute()) + ' 星期' + solar.getWeekInChinese() + '</td>';
    s += '</tr>';

    s += '<tr>';
    s += '<td>节气：</td>';
    var prevJieQi = lunar.getPrevJie();
    var jieQiSolar = prevJieQi.getSolar();
    s += '<td colspan="10" class="left">' + prevJieQi.getName() + '：' + jieQiSolar.getMonth() + '月' + jieQiSolar.getDay() + '日' + padding(jieQiSolar.getHour()) + ':' + padding(jieQiSolar.getMinute()) + '；';
    var nextJieQi = lunar.getNextJie();
    jieQiSolar = nextJieQi.getSolar();
    s += nextJieQi.getName() + '：' + jieQiSolar.getMonth() + '月' + jieQiSolar.getDay() + '日' + padding(jieQiSolar.getHour()) + ':' + padding(jieQiSolar.getMinute());
    s += '</td>';
    s += '</tr>';

    var riGan = '日干';
    var baziTitle = '八字';
    // var daYunTitle = '大运';
    // var liuNianTitle = '流年';
    // var liuYueTitle = '流月';
    if (1 == gender) {
      baziTitle = '乾造';
      riGan = '元男';
    } else if (0 == gender) {
      baziTitle = '坤造';
      riGan = '元女';
    }

    var baZiShiShen =
      [
        {
          title: "年柱",
          shishen: bazi.getYearShiShenGan(),
          tiangan: bazi.getYearGan(),
          dizhi: bazi.getYearZhi(),
          hidegan: bazi.getYearHideGan(),
          hideshishen: bazi.getYearShiShenZhi()
        },
        {
          title: "月柱",
          shishen: bazi.getMonthShiShenGan(),
          tiangan: bazi.getMonthGan(),
          dizhi: bazi.getMonthZhi(),
          hidegan: bazi.getMonthHideGan(),
          hideshishen: bazi.getMonthShiShenZhi()
        },
        {
          title: "日柱",
          shishen: riGan,
          tiangan: bazi.getDayGan(),
          dizhi: bazi.getDayZhi(),
          hidegan: bazi.getDayHideGan(),
          hideshishen: bazi.getDayShiShenZhi()

        },
        {
          title: "时柱",
          shishen: bazi.getTimeShiShenGan(),
          tiangan: bazi.getTimeGan(),
          dizhi: bazi.getTimeZhi(),
          hidegan: bazi.getTimeHideGan(),
          hideshishen: bazi.getTimeShiShenZhi()

        },
        {
          title: "大运",
          shishen: currentYun.daYunShiShen,
          tiangan: currentYun.daYunGanZhi.substr(0, 1),
          dizhi: currentYun.daYunGanZhi.substr(1),
          hideshishen: currentYun.daYunShiShenZhi,
          hidegan: currentYun.daYunHideGan
        },
        {
          title: "流年",
          shishen: currentYun.liuNianShiShen,
          tiangan: currentYun.liuNianGanZhi.substr(0, 1),
          dizhi: currentYun.liuNianGanZhi.substr(1),
          hideshishen: currentYun.liuNianShiShenZhi,
          hidegan: currentYun.liuNianHideGan

        },
        {
          title: "流月",
          shishen: currentYun.liuYueShiShen,
          tiangan: currentYun.liuYueGanZhi.substr(0, 1),
          dizhi: currentYun.liuYueGanZhi.substr(1),
          hideshishen: currentYun.liuYueShiShenZhi,
          hidegan: currentYun.liuYueHideGan

        },

      ];
    this.setState({
      baZiShiShen: baZiShiShen,
      daYunSize: daYunSize,
      daYun
    });
    // s += '<tr>';
    // s += '<td rowspan="4" valign="top">' + baziTitle + '：</td>';
    // s += '<td>年柱</td>';
    // s += '<td>月柱</td>';
    // s += '<td>日柱</td>';
    // s += '<td>时柱</td>';
    // s += '<td></td>';
    // s += '<td>' + daYunTitle + '</td>';
    // s += '<td>' + liuNianTitle + '</td>';
    // s += '<td>' + liuYueTitle + '</td>';
    // s += '<td colspan="2"></td>';
    // s += '</tr>';
    // s += '<tr>';
    // s += '<td class="small">' + bazi.getYearShiShenGan() + '</td>';
    // s += '<td class="small">' + bazi.getMonthShiShenGan() + '</td>';
    // s += '<td class="small">' + riGan + '</td>';
    // s += '<td class="small">' + bazi.getTimeShiShenGan() + '</td>';
    // if (currentYun) {
    //   s += '<td></td>';
    //   s += '<td class="small">' + currentYun.daYunShiShen + '</td>';
    //   s += '<td class="small">' + currentYun.liuNianShiShen + '</td>';
    //   s += '<td class="small">' + currentYun.liuYueShiShen + '</td>';
    //   s += '<td colspan="2"></td>';
    // } else {
    //   s += '<td colspan="6"></td>';
    // }
    // s += '</tr>';
    // s += '<tr>';
    // s += '<td class="bazi">' + bazi.getYearGan() + '<br>' + bazi.getYearZhi() + '</td>';
    // s += '<td class="bazi">' + bazi.getMonthGan() + '<br>' + bazi.getMonthZhi() + '</td>';
    // s += '<td class="bazi">' + bazi.getDayGan() + '<br>' + bazi.getDayZhi() + '</td>';
    // s += '<td class="bazi">' + bazi.getTimeGan() + '<br>' + bazi.getTimeZhi() + '</td>';
    // if (currentYun) {
    //   s += '<td></td>';
    //   s += '<td class="bazi">' + (currentYun.daYunGanZhi ? (currentYun.daYunGanZhi.substr(0, 1) + '<br>' + currentYun.daYunGanZhi.substr(1)) : '') + '</td>';
    //   s += '<td class="bazi">' + currentYun.liuNianGanZhi.substr(0, 1) + '<br>' + currentYun.liuNianGanZhi.substr(1) + '</td>';
    //   s += '<td class="bazi">' + currentYun.liuYueGanZhi.substr(0, 1) + '<br>' + currentYun.liuYueGanZhi.substr(1) + '</td>';
    //   s += '<td colspan="2"></td>';
    // } else {
    //   s += '<td colspan="6"></td>';
    // }
    // s += '</tr>';
    // s += '<tr>';
    // var hideGan = bazi.getYearHideGan();
    // var shiShenZhi = bazi.getYearShiShenZhi();
    // s += '<td valign="top" class="small">';
    // for (var i = 0, j = hideGan.length; i < j; i++) {
    //   s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //   s += hideGan[i] + '-' + shiShenZhi[i];
    //   s += '</div>';
    // }
    // s += '</td>';
    // hideGan = bazi.getMonthHideGan();
    // shiShenZhi = bazi.getMonthShiShenZhi();
    // s += '<td valign="top" class="small">';
    // for (var i = 0, j = hideGan.length; i < j; i++) {
    //   s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //   s += hideGan[i] + '-' + shiShenZhi[i];
    //   s += '</div>';
    // }
    // s += '</td>';
    // hideGan = bazi.getDayHideGan();
    // shiShenZhi = bazi.getDayShiShenZhi();
    // s += '<td valign="top" class="small">';
    // for (var i = 0, j = hideGan.length; i < j; i++) {
    //   s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //   s += hideGan[i] + '-' + shiShenZhi[i];
    //   s += '</div>';
    // }
    // s += '</td>';
    // hideGan = bazi.getTimeHideGan();
    // shiShenZhi = bazi.getTimeShiShenZhi();
    // s += '<td valign="top" class="small">';
    // for (var i = 0, j = hideGan.length; i < j; i++) {
    //   s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //   s += hideGan[i] + '-' + shiShenZhi[i];
    //   s += '</div>';
    // }
    // s += '</td>';
    // if (currentYun) {
    //   s += '<td></td>';
    //   s += '<td class="small" valign="top">';
    //   for (var i = 0, j: number = currentYun.daYunShiShenZhi.length; i < j; i++) {
    //     s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //     s += currentYun.daYunShiShenZhi[i];
    //     s += '</div>';
    //   }
    //   s += '</td>';
    //   s += '<td class="small" valign="top">';
    //   for (var i = 0, j: number = currentYun.liuNianShiShenZhi.length; i < j; i++) {
    //     s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //     s += currentYun.liuNianShiShenZhi[i];
    //     s += '</div>';
    //   }
    //   s += '</td>';
    //   s += '<td class="small" valign="top">';
    //   for (var i = 0, j: number = currentYun.liuYueShiShenZhi.length; i < j; i++) {
    //     s += '<div' + (i == 0 ? ' class="red"' : '') + '>';
    //     s += currentYun.liuYueShiShenZhi[i];
    //     s += '</div>';
    //   }
    //   s += '</td>';
    //   s += '<td colspan="2"></td>';
    // } else {
    //   s += '<td colspan="6"></td>';
    // }
    // s += '</tr>';

    // if (-1 != gender) {
    //   s += '<tr>';
    //   s += '<td>起运：</td>';
    //   s += '<td colspan="10" class="left">' + startYunSolar.getYear() + '年' + startYunSolar.getMonth() + '月' + startYunSolar.getDay() + '日</td>';
    //   s += '</tr>';

    //   s += '<tr>';
    //   s += '<td>周岁：</td>';
    //   for (var i = 0; i < daYunSize; i++) {
    //     var d = daYun[i];
    //     s += '<td' + (i >= daYunSize - 2 ? ' class="hide"' : '') + '>' + d.getStartAge() + '</td>';
    //   }
    //   s += '</tr>';
    //   s += '<tr>';
    //   s += '<td>换运：</td>';
    //   for (var i = 0; i < daYunSize; i++) {
    //     var d = daYun[i];
    //     s += '<td' + (i >= daYunSize - 2 ? ' class="hide"' : '') + '>' + d.getStartYear() + '</td>';
    //   }
    //   s += '</tr>';
    //   s += '<tr>';
    //   s += '<td>十神：</td>';
    //   for (var i = 0; i < daYunSize; i++) {
    //     var d = daYun[i];
    //     var shiShen = LunarUtil.SHI_SHEN_GAN[bazi.getDayGan() + d.getGanZhi().substr(0, 1)];
    //     s += '<td class="small' + (i >= daYunSize - 2 ? ' hide' : '') + '">' + (shiShen ? shiShen : '') + '</td>';
    //   }
    //   s += '</tr>';
    //   s += '<tr>';
    //   s += '<td>运程：</td>';
    //   for (var i = 0; i < daYunSize; i++) {
    //     var d = daYun[i];
    //     var ganZhi = d.getGanZhi();
    //     if (!ganZhi) {
    //       s += '<td class="red">童限</td>';
    //     } else {
    //       s += '<td class="bold' + (d.getStartYear() <= currentYear && currentYear <= d.getEndYear() ? ' red' : '') + (i >= daYunSize - 2 ? ' hide' : '') + '">' + ganZhi + '</td>';
    //     }
    //   }
    //   s += '</tr>';
    //   s += '<tr>';
    //   s += '<td valign="top">流年：</td>';
    //   for (var i = 0; i < daYunSize; i++) {
    //     var d = daYun[i];
    //     var liuNian = d.getLiuNian();
    //     s += '<td valign="top"' + (i >= daYunSize - 2 ? ' class="hide"' : '') + '>';
    //     for (var x = 0, y: number = liuNian.length; x < y; x++) {
    //       var n = liuNian[x];
    //       s += '<div' + (n.getYear() == currentYear ? ' class="red"' : '') + '>' + n.getGanZhi() + '</div>';
    //     }
    //     s += '</td>';
    //   }
    //   s += '</tr>';
    // }

    // s += '</tbody></table>';
    return s;
  }
  render() {
    const { date,
      // sex,
      dateError,
      baZiShiShen,
      daYun
    } = this.state;
    return (
      <SafeAreaView className="montyly-payments">
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ScrollView
          className="scroll-content"
          scrollY
          enableBackToTop
        >
          <View className="content">
            <AtTextarea
              value={date}
              className={dateError ? "" : ""}
              onChange={this.handleDateChange.bind(this)}
              maxLength={200}
              placeholder="输入日期..."
            />
            {/* <AtRadio
              options={[
                { label: '男', value: '1', },
                { label: '女', value: '2' },
              ]}
              value={sex}
              onClick={this.handleSexChange.bind(this)}
            /> */}

            <View className="bazi">
              {baZiShiShen.map((item, index) => {
                return (<View className="bazi_item" key={index}>
                  <Text>{item.title}</Text>
                  <Text>{item.shishen}</Text>
                  <Text>{item.tiangan}</Text>
                  <Text>{item.dizhi}</Text>
                  <View>
                    <Text>
                      {item.hidegan}
                    </Text>
                    <Text>
                      {item.hideshishen}
                    </Text>
                  </View>
                </View>);
              })}
            </View>
            <View className="dayun">
              {daYun.map((item, index) => {
                return (<View key={index}>
                  <Text>{item._startYear}</Text>
                  <Text>{item._startAge}~{item._endAge}岁</Text>
                  <View>{item.getGanZhi()}</View>

                  <View><Text>干</Text><Text>十神</Text></View>
                </View>);
              })}

            </View>
            <View className="liunian" />
            <View className="liuyue" />
            <View className="liuri" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
