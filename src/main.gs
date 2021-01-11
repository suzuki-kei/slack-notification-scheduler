
/**
 *
 * Entry point.
 *
 */
function main() {
    //SlackNotificationApplication.setupSchedulingTrigger()
    //SlackNotificationApplication.setupNotificationTriggers()

    const now = new Date("2020-02-01 00:00:00.000")
    SlackNotificationApplication._getScheduler()._updateNextNotificationDatetime(now)
}

/**
 *
 * TODO コメントを書く.
 *
 */
class SlackNotificationApplication {

    /**
     *
     * スケジューリング用の Trigger をセットアップする.
     *
     * 既にセットアップ済みの場合, 既存の Trigger を削除し, 再作成する.
     *
     */
    static setupSchedulingTrigger() {
        const handlerFunctionName = [this.name, this.setupNotificationTriggers.name].join(".")
        Triggers.deleteProjectTriggers(handlerFunctionName)
        ScriptApp.newTrigger(handlerFunctionName)
                 .timeBased()
                 .inTimezone(Session.getTimeZone())
                 .everyDays(1)
                 .atHour(23)
                 .nearMinute(0)
                 .create()
    }

    /**
     *
     * 通知用の Trigger をセットアップする.
     *
     */
    static setupNotificationTriggers() {
        const now = new Date()
        const handlerFunctionName = [this.name, this.notifyIfNecessary.name].join(".")
        const scheduler = this._getScheduler()
        scheduler.setupNotificationTriggers(now, handlerFunctionName)
    }

    /**
     *
     * 通知する.
     *
     */
    static notifyIfNecessary() {
        const now = new Date()
        const scheduler = this._getScheduler()
        scheduler.notifyIfNecessary(now)
    }

    /**
     *
     * セットアップ済みの Scheduler を取得する.
     *
     * @return {Scheduler}
     *     セットアップ済みの Scheduler.
     *
     */
    static _getScheduler() {
        const scheduleSheet = this._getScheduleSheet()
        const calendarFactory = this._getCalendarFactory()
        const notifier = new SlackNotifier()
        return new Scheduler(scheduleSheet, calendarFactory, notifier)
    }

    /**
     *
     * TODO コメントを書く.
     *
     */
    static _getCalendarFactory() {
        const holidays = CalendarFactory.getJapaneseHolidays()
        const firstDayOfWeek = 1 // 月曜日
        return new CalendarFactory(holidays, firstDayOfWeek)
    }

    /**
     *
     * ScheduleSheet を取得する.
     *
     * @return {ScheduleSheet}
     *     ScheduleSheet.
     *
     */
    static _getScheduleSheet() {
        const numRows = 1000
        const sheetName = "スケジュール"
        return new ScheduleSheet(sheetName, numRows)
    }

}

