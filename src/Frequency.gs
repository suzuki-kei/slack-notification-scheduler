
/**
 *
 * スケジュールの頻度.
 *
 * このクラスは抽象クラスとしての役割を持ち, 具体的な処理は派生クラスで実装する.
 *
 */
class Frequency {

    /**
     *
     * インスタンスを構築する.
     *
     * @param {number} nth
     *     N 日目や N 営業日目などの除数を指定する.
     *
     * @param {number} dow
     *     曜日.
     *     Date#getDay() と同じく 0 が日曜日, 6 が土曜日を表す.
     *
     * @param {number} hours
     *     時間.
     *
     * @param {number} minutes
     *     分.
     *
     * @param {Date} datetime
     *     日時.
     *
     * @param {CalendarFactory} calendarFactory
     *     日付操作に使用する CalendarFactory.
     *
     * @throws Error
     *     引数に明らかに不正な値が指定された場合.
     *
     */
    constructor(nth, dow, hours, minutes, datetime) {
        if(!((nth == null) || (typeof(nth) === "number" && -366 <= nth && nth != 0 && nth <= 366)) ||
           !((dow == null) || (typeof(dow) === "number" && 0 <= dow && dow <= 6)) ||
           !((hours == null) || (typeof(hours) === "number" && 0 <= hours && hours <= 24)) ||
           !((minutes == null) || (typeof(minutes) === "number" && 0 <= minutes && minutes <= 59)) ||
           !((datetime == null) || (datetime instanceof Date))) {
            throw Error("Invalid Arguments: " + Array.from(arguments).join(", "))
        }

        this.nth = nth
        this.dow = dow
        this.hours = hours
        this.minutes = minutes
        this.datetime = datetime
    }

    /**
     *
     * 次の通知日時を求める.
     *
     * @param {Date} now
     *     現在日時.
     *
     * @param {CalendarFactory} calendarFactory
     *     日付操作に使用する CalendarFactory.
     *
     * @return {Date}
     *     次の通知日時.
     *
     */
    next(now, calendarFactory) {
        throw Error("Not implemented. Must implement by derived class.")
    }

}

Frequency.Once = class Once extends Frequency {

    static next(now, datetime) {
        if(now >= datetime) {
            return null
        }
        return datetime
    }

    next(now, calendarFactory) {
        return this.constructor.next(now, this.datetime)
    }

}

Frequency.Daily = class Daily extends Frequency {

    static next(now, calendarFactory, hours, minutes) {
        const next = calendarFactory.create(now)
        if(next.compareTime(hours, minutes) >= 0) {
            next.advanceDays(1)
        }
        return next.startOfDay().hours(hours).minutes(minutes).toDate()
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.DailyBusinessDay = class DailyBusinessDay extends Frequency {

    static next(now, calendarFactory, hours, minutes) {
        const next = calendarFactory.create(now)
        if(next.compareTime(hours, minutes) >= 0) {
            next.advanceBusinessDays(1)
        }
        return next.startOfDay().hours(hours).minutes(minutes).toDate()
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.WeeklyNthDay = class WeeklyNthDay extends Frequency {

    static next(now, calendarFactory, dow, hours, minutes) {
        let next = calendarFactory.create(now)
                                  .startOfWeek()
                                  .hours(hours)
                                  .minutes(minutes)
        while(next.day() !== dow || next.compare(now) <= 0) {
            next.advanceDays(1)
        }
        return next.toDate()
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.dow,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.WeeklyNthBusinessDay = class WeeklyNthBusinessDay extends Frequency {

    static next(now, calendarFactory, nth, hours, minutes) {
        // nth 番目の営業日が存在する週を探索する.
        // 無限ループを避けるために直近 1 年間を探索期間とする.
        if(nth > 0) {
            for(let days = 0; days <= 365; days += 7) {
                let next = calendarFactory.create(now)
                                          .advanceDays(days)
                                          .startOfWeek()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0; i < 7; i++) {
                    if(next.isBusinessDay() && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let days = 0; days <= 365; days += 7) {
                let next = calendarFactory.create(now)
                                          .endOfWeek()
                                          .advanceDays(days)
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0; i < 7; i++) {
                    if(next.isBusinessDay() && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
        return null
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.MonthlyNthDay = class MonthlyNthDay extends Frequency {

    static next(now, calendarFactory, nth, hours, minutes) {
        // nth 番目の日が存在する月を探索する.
        // 無限ループを避けるために直近 1 年間を探索期間とする.
        if(nth > 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .startOfMonth()
                                          .hours(hours)
                                          .minutes(minutes)
                if(next.countDaysInMonth() < nth) {
                    continue
                }
                next.advanceDays(nth - 1)
                if(next.compare(now) > 0) {
                    return next.toDate()
                }
            }
        }
        if(nth < 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .endOfMonth()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                if(next.countDaysInMonth() < -nth) {
                    continue
                }
                next.advanceDays(nth + 1)
                if(next.compare(now) > 0) {
                    return next.toDate()
                }
            }
        }
        return null
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.MonthlyNthBusinessDay = class MonthlyNthBusinessDay extends Frequency {

    static next(now, calendarFactory, nth, hours, minutes) {
        // nth 番目の営業日が存在する月を探索する.
        // 無限ループを避けるために直近 1 年間を探索期間とする.
        if(nth > 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .startOfMonth()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInMonth(); i < days; i++) {
                    if(next.isBusinessDay() && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .endOfMonth()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInMonth(); i < days; i++) {
                    if(next.isBusinessDay() && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
        return null
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.MonthlyNthDow = class MonthlyNthDow extends Frequency {

    static next(now, calendarFactory, nth, dow, hours, minutes) {
        // nth 番目の曜日が存在する月を探索する.
        // 無限ループを避けるために直近 1 年間を探索期間とする.
        if(nth > 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .startOfMonth()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInMonth(); i < days; i++) {
                    if(next.day() === dow && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .endOfMonth()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInMonth(); i < days; i++) {
                    if(next.day() === dow && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
        return null
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.dow,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.MonthlyNthDowBusinessDay = class MonthlyNthDowBusinessDay extends Frequency {

    static next(now, calendarFactory, nth, dow, hours, minutes) {
        // nth 番目の営業曜日が存在する月を探索する.
        // 無限ループを避けるために直近 1 年間を探索期間とする.
        if(nth > 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .startOfMonth()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInMonth(); i < days; i++) {
                    if(next.isBusinessDay() && next.day() === dow && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let months = 0; months < 12; months++) {
                let next = calendarFactory.create(now)
                                          .advanceMonths(months)
                                          .endOfMonth()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInMonth(); i < days; i++) {
                    if(next.isBusinessDay() && next.day() === dow && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.dow,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.YearlyNthDay = class YearlyNthDay extends Frequency {

    static next(now, calendarFactory, nth, hours, minutes) {
        // nth 番目の日が存在する年を探索する.
        // 無限ループを避けるために直近 8 年間を探索期間とする.
        if(nth > 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .startOfYear()
                if(next.countDaysInYear() < nth) {
                    continue
                }
                next.advanceDays(nth - 1).hours(hours).minutes(minutes)
                if(next.compare(now) > 0) {
                    return next.toDate()
                }
            }
        }
        if(nth < 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .endOfYear()
                                          .startOfDay()
                if(next.countDaysInYear() < -nth) {
                    continue
                }
                next.advanceDays(nth + 1).hours(hours).minutes(minutes)
                if(next.compare(now) > 0) {
                    return next.toDate()
                }
            }
        }
        return null
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.YearlyNthBusinessDay = class YearlyNthBusinessDay extends Frequency {

    static next(now, calendarFactory, nth, hours, minutes) {
        // nth 番目の営業日が存在する年を探索する.
        // 無限ループを避けるために直近 8 年間を探索期間とする.
        if(nth > 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .startOfYear()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInYear(); i < days; i++) {
                    if(next.isBusinessDay() && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .endOfYear()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInYear(); i < days; i++) {
                    if(next.isBusinessDay() && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
        return null
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.YearlyNthDow = class YearlyNthDow extends Frequency {

    static next(now, calendarFactory, nth, dow, hours, minutes) {
        // nth 番目の曜日が存在する年を探索する.
        // 無限ループを避けるために直近 8 年間を探索期間とする.
        if(nth > 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .startOfYear()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInYear(); i < days; i++) {
                    if(next.day() === dow && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .endOfYear()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInYear(); i < days; i++) {
                    if(next.day() === dow && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.dow,
                                     this.hours,
                                     this.minutes)
    }

}

Frequency.YearlyNthDowBusinessDay = class YearlyNthDowBusinessDay extends Frequency {

    static next(now, calendarFactory, nth, dow, hours, minutes) {
        // nth 番目の営業曜日が存在する年を探索する.
        // 無限ループを避けるために直近 8 年間を探索期間とする.
        if(nth > 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                              .advanceYears(years)
                              .startOfYear()
                              .hours(hours)
                              .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInYear(); i < days; i++) {
                    if(next.isBusinessDay() && next.day() === dow && ++n === nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(1)
                }
            }
        }
        if(nth < 0) {
            for(let years = 0; years < 8; years++) {
                let next = calendarFactory.create(now)
                                          .advanceYears(years)
                                          .endOfYear()
                                          .startOfDay()
                                          .hours(hours)
                                          .minutes(minutes)
                for(let i = 0, n = 0, days = next.countDaysInYear(); i < days; i++) {
                    if(next.isBusinessDay() && next.day() === dow && ++n === -nth && next.compare(now) > 0) {
                        return next.toDate()
                    }
                    next.advanceDays(-1)
                }
            }
        }
    }

    next(now, calendarFactory) {
        return this.constructor.next(now,
                                     calendarFactory,
                                     this.nth,
                                     this.dow,
                                     this.hours,
                                     this.minutes)
    }

}

if(typeof(module) !== "undefined") {
    module.exports.Frequency = Frequency
}

