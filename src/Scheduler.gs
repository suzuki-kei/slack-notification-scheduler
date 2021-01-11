
/**
 *
 * スケジューラ.
 *
 */
class Scheduler {

    /**
     *
     * インスタンスを構築する.
     *
     * @param {ScheduleSheet} ScheduleSheet
     *     スケジュールを読み書きする対象の ScheduleSheet.
     *
     * @param {CalendarFactory} calendarFactory
     *     日付計算に使用するカレンダー.
     *
     * @param {SlackNotifier} notifier
     *     通知で使用する SlackNotifier.
     *
     */
    constructor(scheduleSheet, calendarFactory, notifier) {
        this.scheduleSheet = scheduleSheet
        this.calendarFactory = calendarFactory
        this.notifier = notifier
    }

    /**
     *
     * 通知用の Trigger をセットアップする.
     *
     *     1. セットアップ済みの Trigger を全て削除する.
     *     2. 通知用の Trigger を作成する.
     *     3. Sheet の "次回通知日時" を更新する.
     *
     * @param {Date} now
     *     現在日時.
     *
     * @param {string} handlerFunctionName
     *     Trigger のハンドラとする関数の名前.
     *
     */
    setupNotificationTriggers(now, handlerFunctionName) {
        Triggers.deleteProjectTriggers(handlerFunctionName)
        this._updateNextNotificationDatetime(now)
        this._createNotificationTriggers(now, handlerFunctionName)
    }

    /**
     *
     * 各スケジュールの次回通知日時を更新する.
     *
     * @param {Date} now
     *     現在日時.
     *
     */
    _updateNextNotificationDatetime(now) {
        const schedules = this.scheduleSheet.loadSchedules()
        for(const schedule of schedules) {
            if(!schedule.enabled) {
                continue
            }
            if(!schedule.isValid()) {
                Logger.log("SKIP: " + schedule.title)
                schedule.next = null
                continue
            }
            Logger.log("UPDATE: " + schedule.title)
            const base = now > schedule.last ? now : schedule.last
            schedule.updateNext(base, this.calendarFactory)
        }
        this.scheduleSheet.saveSchedules(schedules)
    }

    /**
     *
     * 通知用の Trigger を作成する.
     *
     * 各スケジュールの次回通知日時に実行されるように複数の Trigger を作成する.
     *
     */
    _createNotificationTriggers(now, handlerFunctionName) {
        const timestamps = new Set()
        const schedules = this.scheduleSheet.loadSchedules()
        for(const schedule of schedules) {
            if(schedule.nextNotificationDatetime != null) {
                timestamps.add(schedule.nextNotificationDatetime.getTime())
            }
        }
        for(const timestamp of timestamps) {
            const date = new Date(timestamp)
            ScriptApp.newTrigger(handlerFunctionName).timeBased().at(date).create()
        }
    }

    /**
     *
     * 通知する.
     *
     */
    notifyIfNecessary(now) {
        const schedules = this.scheduleSheet.loadSchedules()
        for(const schedule of schedules) {
            if(!schedule.isValid() || !schedule.enabled) {
                continue
            }
            if(schedule.needsNotify(now)) {
                this.notifier.notify(schedule)
                schedule.frequency.lastNotificationDatetime = now
            }
        }
        this.scheduleSheet.saveLastNotificationDatetime(schedules)
    }

}

