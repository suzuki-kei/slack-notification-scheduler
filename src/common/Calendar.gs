
/**
 *
 * Calendar インスタンスを生成する機能を提供する.
 *
 */
class CalendarFactory {

    static getJapaneseHolidays() {
        return [
            new Date("2020-01-01 00:00:00.000"), // 元旦
            new Date("2020-01-13 00:00:00.000"), // 成人式
            new Date("2020-02-11 00:00:00.000"), // 建国記念の日
            new Date("2020-02-23 00:00:00.000"), // 天皇誕生日
            new Date("2020-02-24 00:00:00.000"), // 天皇誕生日 振替休日
            new Date("2020-03-20 00:00:00.000"), // 春分の日
            new Date("2020-04-29 00:00:00.000"), // 昭和の日
            new Date("2020-05-03 00:00:00.000"), // 建国記念日
            new Date("2020-05-04 00:00:00.000"), // みどりの日
            new Date("2020-05-05 00:00:00.000"), // こどもの日
            new Date("2020-05-06 00:00:00.000"), // 建国記念日 振替休日
            new Date("2020-07-23 00:00:00.000"), // 海の日
            new Date("2020-07-24 00:00:00.000"), // 体育の日
            new Date("2020-08-10 00:00:00.000"), // 山の日
            new Date("2020-09-21 00:00:00.000"), // 敬老の日
            new Date("2020-09-22 00:00:00.000"), // 秋分の日
            new Date("2020-11-03 00:00:00.000"), // 文化の日
            new Date("2020-11-23 00:00:00.000"), // 勤労感謝の日
            new Date("2021-01-01 00:00:00.000"), // 元旦
            new Date("2021-01-11 00:00:00.000"), // 成人式
            new Date("2021-02-11 00:00:00.000"), // 建国記念の日
            new Date("2021-02-23 00:00:00.000"), // 天皇誕生日
            new Date("2021-03-20 00:00:00.000"), // 春分の日
            new Date("2021-04-29 00:00:00.000"), // 昭和の日
            new Date("2021-05-03 00:00:00.000"), // 建国記念日
            new Date("2021-05-04 00:00:00.000"), // みどりの日
            new Date("2021-05-05 00:00:00.000"), // こどもの日
            new Date("2021-07-22 00:00:00.000"), // 海の日
            new Date("2021-07-23 00:00:00.000"), // 体育の日
            new Date("2021-08-08 00:00:00.000"), // 山の日
            new Date("2021-08-09 00:00:00.000"), // 山の日 振替休日
            new Date("2021-09-20 00:00:00.000"), // 敬老の日
            new Date("2021-09-23 00:00:00.000"), // 秋分の日
            new Date("2021-11-03 00:00:00.000"), // 文化の日
            new Date("2021-11-23 00:00:00.000"), // 勤労感謝の日
        ]
    }

    /**
     *
     * インスタンスを構築する.
     *
     * @param {Array.<Date>} holidays
     *     休日として扱う日付の配列.
     *
     * @param {number} firstDayOfWeek
     *     一週間の最初の日とする曜日.
     *     Date#getDay() と同じく 0 が日曜日, 6 が土曜日を表す.
     *
     */
    constructor(holidays, firstDayOfWeek) {
        this._holidays = holidays
        this._firstDayOfWeek = firstDayOfWeek
    }

    /**
     *
     * Calendar インスタンスを生成する.
     *
     * @param {Date} date
     *     日付.
     *
     * @return {Calendar}
     *     date で指定された日付を表す Calendar.
     *     休日や週初めの曜日はコンストラクタで指定されたものとなる.
     *
     */
    create(date) {
        return new Calendar(date, this._holidays, this._firstDayOfWeek)
    }

}

/**
 *
 * 日付に対する操作を提供する.
 *
 */
class Calendar {

    /**
     *
     * インスタンスを初期化する.
     *
     * @param {Date} date
     *     操作対象の日付.
     *
     * @param {Array.<Date>} holidays
     *     休日.
     *     営業日を考慮した日付計算に使用する.
     *
     * @param {Number} firstDayOfWeek
     *     週始めの曜日.
     *
     */
    constructor(date, holidays, firstDayOfWeek) {
        this._date = new Date(date)
        this._holidays = new Set(holidays.map(_ => _.getTime()))
        this._firstDayOfWeek = firstDayOfWeek
    }

    /**
     *
     * Date に変換する.
     *
     * 一連の日付操作の結果を Date として取得する場合に使用する.
     *
     * @return {Date}
     *     一連の日付操作をした結果の Date.
     *
     */
    toDate() {
        return new Date(this._date)
    }

    /**
     *
     * 休日であるか判定する.
     *
     * @return {boolean}
     *     休日の場合に true.
     *
     */
    isHoliday() {
        // TODO 土日と年末年始を休日とするか外部から指定できるようにする.
        if(this._date.getDay() === 0 || this._date.getDay() === 6) {
            return true
        }
        if(this._date.getMonth() === 0 && this._date.getDate() <= 3) {
            return true
        }
        if(this._date.getMonth() === 11 && this._date.getDate() >= 29) {
            return true
        }
        const date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate())
        return this._holidays.has(date.getTime())
    }

    /**
     *
     * 営業日であるか判定する.
     *
     * @return {boolean}
     *     営業日の場合に true.
     *
     */
    isBusinessDay() {
        return !this.isHoliday()
    }

    /**
     *
     * 月の日数を求める.
     *
     * @return {number}
     *     月の日数.
     *
     */
    countDaysInMonth() {
        const date = new Date(this._date.getFullYear(), this._date.getMonth() + 1, 0)
        return date.getDate()
    }

    /**
     *
     * 年の日数を求める.
     *
     * @return {number}
     *     年の日数.
     *
     */
    countDaysInYear() {
        let numDays = 0

        for(let monthIndex = 0; monthIndex <= 11; monthIndex++) {
            const date = new Date(this._date.getFullYear(), monthIndex + 1, 0)
            numDays += date.getDate()
        }
        return numDays
    }

    /**
     *
     * 一日の開始時刻 (00:00:00.000) に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    startOfDay() {
        this._date.setHours(0)
        this._date.setMinutes(0)
        this._date.setSeconds(0)
        this._date.setMilliseconds(0)
        return this
    }

    /**
     *
     * 一日の終了時刻 (23:59:59.999) に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    endOfDay() {
        this._date.setHours(23)
        this._date.setMinutes(59)
        this._date.setSeconds(59)
        this._date.setMilliseconds(999)
        return this
    }

    /**
     *
     * 週の最初の日の 00:00:00.000 に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    startOfWeek() {
        const days = -(this._date.getDay() - this._firstDayOfWeek + 7) % 7
        this._date.setHours(0)
        this._date.setMinutes(0)
        this._date.setSeconds(0)
        this._date.setMilliseconds(0)
        this._date.setTime(this._date.getTime() + days * 1000 * 60 * 60 * 24)
        return this
    }

    /**
     *
     * 週の最後の日の 23:59:59.999 に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    endOfWeek() {
        return this.startOfWeek().advanceDays(6).endOfDay()
    }

    /**
     *
     * 月の最初の日の 00:00:00.000 に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    startOfMonth() {
        this._date.setDate(1)
        this._date.setHours(0)
        this._date.setMinutes(0)
        this._date.setSeconds(0)
        this._date.setMilliseconds(0)
        return this
    }

    /**
     *
     * 月の最後の日の 23:59:59.999 に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    endOfMonth() {
        this._date.setDate(1)
        this._date.setHours(0)
        this._date.setMinutes(0)
        this._date.setSeconds(0)
        this._date.setMilliseconds(0)
        this._date.setMonth(this._date.getMonth() + 1)
        this._date.setMilliseconds(-1)
        return this
    }

    /**
     *
     * 年の最初の日の 00:00:00.000 に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    startOfYear() {
        this._date.setMonth(0)
        this._date.setDate(1)
        this._date.setHours(0)
        this._date.setMinutes(0)
        this._date.setSeconds(0)
        this._date.setMilliseconds(0)
        return this
    }

    /**
     *
     * 年の最後の日の 23:59:59.999 に変更する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    endOfYear() {
        this._date.setMonth(11)
        this._date.setDate(31)
        this._date.setHours(23)
        this._date.setMinutes(59)
        this._date.setSeconds(59)
        this._date.setMilliseconds(999)
        return this
    }

    /**
     *
     * 指定した日数を加算する.
     *
     * @param {Number} days
     *     加算する日数.
     *     減算したい場合は負数を指定する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    advanceDays(days) {
        this._date.setTime(this._date.getTime() + days * 1000 * 60 * 60 * 24)
        return this
    }

    /**
     *
     * 指定した営業日を加算する.
     *
     * @param {Number} businessDays
     *     加算する営業日数.
     *     減算したい場合は負数を指定する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    advanceBusinessDays(businessDays) {
        while(businessDays > 0) {
            this.advanceDays(1)
            businessDays -= this.isBusinessDay() ? 1 : 0
        }
        while(businessDays < 0) {
            this.advanceDays(-1)
            businessDays += this.isBusinessDay() ? 1 : 0
        }
        return this
    }

    /**
     *
     * 指定した月数を加算する.
     *
     * 日付が変更後の月に収まらない場合は, 月の最終日に丸められる.
     *
     * @param {number} months
     *     加算する月数.
     *     減算したい場合は負数を指定する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    advanceMonths(months) {
        const advanced = new Date(this._date.getFullYear(),
                                  this._date.getMonth() + months,
                                  this._date.getDate(),
                                  this._date.getHours(),
                                  this._date.getMinutes(),
                                  this._date.getSeconds(),
                                  this._date.getMilliseconds())
        if(advanced.getDate() !== this._date.getDate()) {
            advanced.setDate(0)
        }
        this._date = advanced
        return this
    }

    /**
     *
     * 指定した年数を加算する.
     *
     * 日付が変更後の月に収まらない場合は, 月の最終日に丸められる.
     *
     * @param {number} years
     *     加算する年数.
     *     減算したい場合は負数を指定する.
     *
     * @return {Calendar}
     *     このインスタンスを返す.
     *
     */
    advanceYears(years) {
        const advanced = new Date(this._date.getFullYear() + years,
                                  this._date.getMonth(),
                                  this._date.getDate(),
                                  this._date.getHours(),
                                  this._date.getMinutes(),
                                  this._date.getSeconds(),
                                  this._date.getMilliseconds())
        if(advanced.getDate() !== this._date.getDate()) {
            advanced.setDate(0)
        }
        this._date = advanced
        return this
    }

    /**
     *
     * 年を取得または設定する.
     *
     * 引数を省略した場合は年を取得する.
     * 引数を指定した場合は年を設定する.
     *
     * @param {number|undefined} value
     *     設定する年.
     *     年を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合は年.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    year(value) {
        if(typeof(value) === "undefined") {
            return this._date.getFullYear()
        }
        this._date.setFullYear(value)
        return this
    }

    /**
     *
     * 月を取得または設定する.
     *
     * 引数を省略した場合は月を取得する.
     * 引数を指定した場合は月を設定する.
     *
     * @param {number|undefined} value
     *     設定する月.
     *     月を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合は月.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    month(value) {
        if(typeof(value) === "undefined") {
            return this._date.getMonth()
        }
        this._date.setMonth(value)
        return this
    }

    /**
     *
     * 日を取得または設定する.
     *
     * 引数を省略した場合は日を取得する.
     * 引数を指定した場合は日を設定する.
     *
     * @param {number|undefined} value
     *     設定する日.
     *     日を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合は日.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    date(value) {
        if(typeof(value) === "undefined") {
            return this._date.getDate()
        }
        this._date.setDate(value)
        return this
    }

    /**
     *
     * 曜日を取得する.
     *
     * @return {number|Calendar}
     *     曜日.
     *     Date#getDay() と同じく 0 が日曜日, 6 が土曜日を表す.
     *
     */
    day() {
        return this._date.getDay()
    }

    /**
     *
     * 時間を取得または設定する.
     *
     * 引数を省略した場合は時間を取得する.
     * 引数を指定した場合は時間を設定する.
     *
     * @param {number|undefined} value
     *     設定する時間.
     *     時間を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合は時間.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    hours(value) {
        if(typeof(value) === "undefined") {
            return this._date.getHours()
        }
        this._date.setHours(value)
        return this
    }

    /**
     *
     * 分を取得または設定する.
     *
     * 引数を省略した場合は分を取得する.
     * 引数を指定した場合は分を設定する.
     *
     * @param {number|undefined} value
     *     設定する分.
     *     分を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合は分.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    minutes(value) {
        if(typeof(value) === "undefined") {
            return this._date.getMinutes()
        }
        this._date.setMinutes(value)
        return this
    }

    /**
     *
     * 秒を取得または設定する.
     *
     * 引数を省略した場合は秒を取得する.
     * 引数を指定した場合は秒を設定する.
     *
     * @param {number|undefined} value
     *     設定する秒.
     *     秒を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合は秒.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    seconds(value) {
        if(typeof(value) === "undefined") {
            return this._date.getSeconds()
        }
        this._date.setSeconds(value)
        return this
    }

    /**
     *
     * ミリ秒を取得または設定する.
     *
     * 引数を省略した場合はミリ秒を取得する.
     * 引数を指定した場合はミリ秒を設定する.
     *
     * @param {number|undefined} value
     *     設定するミリ秒.
     *     ミリ秒を取得する場合は引数を省略する.
     *
     * @return {number|Calendar}
     *     引数を省略した場合はミリ秒.
     *     引数を指定した場合は, このインスタンスを返す.
     *
     */
    milliseconds(value) {
        if(typeof(value) === "undefined") {
            return this._date.getMilliseconds()
        }
        this._date.setMilliseconds(value)
        return this
    }

    /**
     *
     * 指定した日付と大小比較する.
     *
     * @param {Date} date
     *     比較対象の日付.
     *
     * @return {number}
     *     date と等しい場合は 0.
     *     date より小さい場合は -1.
     *     date より大きい場合は +1.
     *
     */
    compare(date) {
        return Math.sign(this._date.getTime() - date.getTime())
    }

    /**
     *
     * 指定した時刻と大小比較する.
     *
     * @param {number} hours
     *     時間.
     *     省略した場合は 0.
     *
     * @param {number} minutes
     *     分.
     *     省略した場合は 0.
     *
     * @param {number} seconds
     *     秒.
     *     省略した場合は 0.
     *
     * @param {number} milliseconds
     *     ミリ秒.
     *     省略した場合は 0.
     *
     * @return {number}
     *     指定した時刻と等しい場合は 0.
     *     指定した時刻より前である場合は -1.
     *     指定した時刻より後である場合は +1.
     *
     */
    compareTime(hours, minutes, seconds, milliseconds) {
        const date = new Date(this._date.getFullYear(),
                              this._date.getMonth(),
                              this._date.getDate(),
                              hours || 0,
                              minutes || 0,
                              seconds || 0,
                              milliseconds || 0)
        return this.compare(date)
    }

}

if(typeof(module) !== "undefined") {
    module.exports.Calendar = Calendar
    module.exports.CalendarFactory = CalendarFactory
}

