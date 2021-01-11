
/**
 *
 * スケジュール.
 *
 */
class Schedule {

    /**
     *
     * インスタンスを構築する.
     *
     * @param {string} title
     *     スケジュールのタイトル.
     *
     * @param {string} owner
     *     スケジュールのオーナー.
     *
     * @param {boolean} enabled
     *     有効フラグ.
     *
     * @param {Date} last
     *     最終通知日時.
     *
     * @param {Date} next
     *     次回通知日時.
     *
     * @param {Frequency} frequency
     *     頻度.
     *
     * @param {Destination} destination
     *     通知先.
     *
     */
    constructor(title, owner, enabled, last, next, frequency, destination) {
        this.title = title
        this.owner = owner
        this.enabled = enabled
        this.last = last
        this.next = next
        this.frequency = frequency
        this.destination = destination
    }

    isValid() {
        return !!(this.frequency && this.destination)
    }

    updateNext(now, calendarFactory) {
        if(!this.isValid()) {
            return
        }
        this.next = this.frequency.next(now, calendarFactory)
    }

    needsNotify() {
        if(!this.isValid() || !this.enabled) {
            return false
        }
        if(!(this.next instanceof Date)) {
            return false
        }
        return now >= this.next
    }

}

if(typeof(module) !== "undefined") {
    module.exports.Schedule = Schedule
}

