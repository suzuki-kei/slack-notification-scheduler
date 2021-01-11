
const assert = require("assert")

const $calendar = require("../../src/common/Calendar.gs")
const Calendar = $calendar.Calendar
const CalendarFactory = $calendar.CalendarFactory

describe("Calendar", () => {

    before(() => {
        const holidays = CalendarFactory.getJapaneseHolidays()
        const firstDayOfWeek = 1 // 月曜日
        calendarFactory = new CalendarFactory(holidays, firstDayOfWeek)
    })

    describe("Calendar#toDate", () => {
        it("#0", () => {
            const dateString = "2020-07-07 12:34:56.789"
            const base = new Date(dateString)
            const expected = new Date(dateString)
            const calendar = calendarFactory.create(base)
            const actual = base
            assert.deepEqual(actual, expected)
        })
    })

    describe("Calendar#advanceBusinessDays", () => {
        [
            ["2021-01-01 00:00:00.000", -7, "2020-12-18 00:00:00.000"],
            ["2021-01-01 00:00:00.000", -6, "2020-12-21 00:00:00.000"],
            ["2021-01-01 00:00:00.000", -5, "2020-12-22 00:00:00.000"],
            ["2021-01-01 00:00:00.000", -4, "2020-12-23 00:00:00.000"],
            ["2021-01-01 00:00:00.000", -3, "2020-12-24 00:00:00.000"],
            ["2021-01-01 00:00:00.000", -2, "2020-12-25 00:00:00.000"],
            ["2021-01-01 00:00:00.000", -1, "2020-12-28 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  0, "2021-01-01 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  1, "2021-01-04 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  2, "2021-01-05 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  3, "2021-01-06 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  4, "2021-01-07 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  5, "2021-01-08 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  6, "2021-01-12 00:00:00.000"],
            ["2021-01-01 00:00:00.000",  7, "2021-01-13 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -7, "2021-06-28 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -6, "2021-06-29 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -5, "2021-06-30 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -4, "2021-07-01 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -3, "2021-07-02 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -2, "2021-07-05 00:00:00.000"],
            ["2021-07-07 00:00:00.000", -1, "2021-07-06 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  0, "2021-07-07 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  1, "2021-07-08 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  2, "2021-07-09 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  3, "2021-07-12 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  4, "2021-07-13 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  5, "2021-07-14 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  6, "2021-07-15 00:00:00.000"],
            ["2021-07-07 00:00:00.000",  7, "2021-07-16 00:00:00.000"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const businessDays = values[1]
                const expected = new Date(values[2])
                const calendar = calendarFactory.create(base)
                calendar.advanceBusinessDays(businessDays)
                const actual = calendar.toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#isHoliday", () => {
        [
            ["2020-12-25 00:00:00.000", false], // 平日
            ["2020-12-26 00:00:00.000", true],  // 土曜日
            ["2020-12-27 00:00:00.000", true],  // 日曜日
            ["2020-12-28 00:00:00.000", false], // 平日
            ["2020-12-29 00:00:00.000", true],  // 会社休業日
            ["2020-12-30 00:00:00.000", true],  // 会社休業日
            ["2020-12-31 00:00:00.000", true],  // 会社休業日
            ["2021-01-01 00:00:00.000", true],  // 元旦, 会社休業日
            ["2021-01-02 00:00:00.000", true],  // 会社休業日
            ["2021-01-03 00:00:00.000", true],  // 会社休業日
            ["2021-01-04 00:00:00.000", false], // 平日
            ["2021-01-05 00:00:00.000", false], // 平日
            ["2021-01-06 00:00:00.000", false], // 平日
            ["2021-01-07 00:00:00.000", false], // 平日
            ["2021-01-08 00:00:00.000", false], // 平日
            ["2021-01-09 00:00:00.000", true],  // 土曜日
            ["2021-01-10 00:00:00.000", true],  // 日曜日
            ["2021-01-11 00:00:00.000", true],  // 成人式
            ["2021-01-12 00:00:00.000", false], // 平日
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = values[1]
                const calendar = calendarFactory.create(base)
                const actual = calendar.isHoliday()
                assert.equal(actual, expected)
            })
        })
    })

    describe("Calendar#isBusinessDay", () => {
        [
            ["2020-12-25 00:00:00.000", true],  // 平日
            ["2020-12-26 00:00:00.000", false], // 土曜日
            ["2020-12-27 00:00:00.000", false], // 日曜日
            ["2020-12-28 00:00:00.000", true],  // 平日
            ["2020-12-29 00:00:00.000", false], // 会社休業日
            ["2020-12-30 00:00:00.000", false], // 会社休業日
            ["2020-12-31 00:00:00.000", false], // 会社休業日
            ["2021-01-01 00:00:00.000", false], // 元旦, 会社休業日
            ["2021-01-02 00:00:00.000", false], // 会社休業日
            ["2021-01-03 00:00:00.000", false], // 会社休業日
            ["2021-01-04 00:00:00.000", true],  // 平日
            ["2021-01-05 00:00:00.000", true],  // 平日
            ["2021-01-06 00:00:00.000", true],  // 平日
            ["2021-01-07 00:00:00.000", true],  // 平日
            ["2021-01-08 00:00:00.000", true],  // 平日
            ["2021-01-09 00:00:00.000", false], // 土曜日
            ["2021-01-10 00:00:00.000", false], // 日曜日
            ["2021-01-11 00:00:00.000", false], // 成人式
            ["2021-01-12 00:00:00.000", true],  // 平日
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = values[1]
                const calendar = calendarFactory.create(base)
                const actual = calendar.isBusinessDay()
                assert.equal(actual, expected)
            })
        })
    })

    describe("Calendar#countDaysInMonth", () => {
        [
            ["2020-01-01 00:00:00.000", 31],
            ["2020-02-01 00:00:00.000", 29],
            ["2020-03-01 00:00:00.000", 31],
            ["2020-04-01 00:00:00.000", 30],
            ["2020-05-01 00:00:00.000", 31],
            ["2020-06-01 00:00:00.000", 30],
            ["2020-07-01 00:00:00.000", 31],
            ["2020-08-01 00:00:00.000", 31],
            ["2020-09-01 00:00:00.000", 30],
            ["2020-10-01 00:00:00.000", 31],
            ["2020-11-01 00:00:00.000", 30],
            ["2020-12-01 00:00:00.000", 31],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = values[1]
                const calendar = calendarFactory.create(base)
                const actual = calendar.countDaysInMonth()
                assert.equal(actual, expected)
            })
        })
    })

    describe("Calendar#countDaysInYear", () => {
        [
            ["2020-01-01 00:00:00.000", 366],
            ["2021-01-01 00:00:00.000", 365],
            ["2022-01-01 00:00:00.000", 365],
            ["2023-01-01 00:00:00.000", 365],
            ["2024-01-01 00:00:00.000", 366],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = values[1]
                const calendar = calendarFactory.create(base)
                const actual = calendar.countDaysInYear()
                assert.equal(actual, expected)
            })
        })
    })

    describe("Calendar#startOfDay", () => {
        [
            ["2020-07-07 00:00:00.000", "2020-07-07 00:00:00.000"],
            ["2020-07-07 12:34:56.789", "2020-07-07 00:00:00.000"],
            ["2020-07-07 23:59:59.999", "2020-07-07 00:00:00.000"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = new Date(values[1])
                const calendar = calendarFactory.create(base)
                const actual = calendar.startOfDay().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#endOfDay", () => {
        [
            ["2020-07-07 00:00:00.000", "2020-07-07 23:59:59.999"],
            ["2020-07-07 12:34:56.789", "2020-07-07 23:59:59.999"],
            ["2020-07-07 23:59:59.999", "2020-07-07 23:59:59.999"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = new Date(values[1])
                const calendar = calendarFactory.create(base)
                const actual = calendar.endOfDay().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#startOfWeek", () => {
        [
            ["2020-07-04 23:59:59.999", 0, "2020-06-28 00:00:00.000"],
            ["2020-07-05 00:00:00.000", 0, "2020-07-05 00:00:00.000"],
            ["2020-07-11 23:59:59.999", 0, "2020-07-05 00:00:00.000"],
            ["2020-07-12 00:00:00.000", 0, "2020-07-12 00:00:00.000"],
            ["2020-07-05 23:59:59.999", 1, "2020-06-29 00:00:00.000"],
            ["2020-07-06 00:00:00.000", 1, "2020-07-06 00:00:00.000"],
            ["2020-07-12 23:59:59.999", 1, "2020-07-06 00:00:00.000"],
            ["2020-07-13 00:00:00.000", 1, "2020-07-13 00:00:00.000"],
            ["2020-07-06 23:59:59.999", 2, "2020-06-30 00:00:00.000"],
            ["2020-07-07 00:00:00.000", 2, "2020-07-07 00:00:00.000"],
            ["2020-07-13 23:59:59.999", 2, "2020-07-07 00:00:00.000"],
            ["2020-07-14 00:00:00.000", 2, "2020-07-14 00:00:00.000"],
            ["2020-07-07 23:59:59.999", 3, "2020-07-01 00:00:00.000"],
            ["2020-07-08 00:00:00.000", 3, "2020-07-08 00:00:00.000"],
            ["2020-07-14 23:59:59.999", 3, "2020-07-08 00:00:00.000"],
            ["2020-07-15 00:00:00.000", 3, "2020-07-15 00:00:00.000"],
            ["2020-07-08 23:59:59.999", 4, "2020-07-02 00:00:00.000"],
            ["2020-07-09 00:00:00.000", 4, "2020-07-09 00:00:00.000"],
            ["2020-07-15 23:59:59.999", 4, "2020-07-09 00:00:00.000"],
            ["2020-07-16 00:00:00.000", 4, "2020-07-16 00:00:00.000"],
            ["2020-07-09 23:59:59.999", 5, "2020-07-03 00:00:00.000"],
            ["2020-07-10 00:00:00.000", 5, "2020-07-10 00:00:00.000"],
            ["2020-07-16 23:59:59.999", 5, "2020-07-10 00:00:00.000"],
            ["2020-07-17 00:00:00.000", 5, "2020-07-17 00:00:00.000"],
            ["2020-07-10 23:59:59.999", 6, "2020-07-04 00:00:00.000"],
            ["2020-07-11 00:00:00.000", 6, "2020-07-11 00:00:00.000"],
            ["2020-07-17 23:59:59.999", 6, "2020-07-11 00:00:00.000"],
            ["2020-07-18 00:00:00.000", 6, "2020-07-18 00:00:00.000"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const firstDayOfWeek = values[1]
                const expected = new Date(values[2])
                const calendar = calendarFactory.create(base)
                calendar._firstDayOfWeek = firstDayOfWeek
                const actual = calendar.startOfWeek().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#endOfWeek", () => {
        [
            ["2020-07-04 23:59:59.999", 0, "2020-07-04 23:59:59.999"],
            ["2020-07-05 00:00:00.000", 0, "2020-07-11 23:59:59.999"],
            ["2020-07-11 23:59:59.999", 0, "2020-07-11 23:59:59.999"],
            ["2020-07-12 00:00:00.000", 0, "2020-07-18 23:59:59.999"],
            ["2020-07-05 23:59:59.999", 1, "2020-07-05 23:59:59.999"],
            ["2020-07-06 00:00:00.000", 1, "2020-07-12 23:59:59.999"],
            ["2020-07-12 23:59:59.999", 1, "2020-07-12 23:59:59.999"],
            ["2020-07-13 00:00:00.000", 1, "2020-07-19 23:59:59.999"],
            ["2020-07-06 23:59:59.999", 2, "2020-07-06 23:59:59.999"],
            ["2020-07-07 00:00:00.000", 2, "2020-07-13 23:59:59.999"],
            ["2020-07-13 23:59:59.999", 2, "2020-07-13 23:59:59.999"],
            ["2020-07-14 00:00:00.000", 2, "2020-07-20 23:59:59.999"],
            ["2020-07-07 23:59:59.999", 3, "2020-07-07 23:59:59.999"],
            ["2020-07-08 00:00:00.000", 3, "2020-07-14 23:59:59.999"],
            ["2020-07-14 23:59:59.999", 3, "2020-07-14 23:59:59.999"],
            ["2020-07-15 00:00:00.000", 3, "2020-07-21 23:59:59.999"],
            ["2020-07-08 23:59:59.999", 4, "2020-07-08 23:59:59.999"],
            ["2020-07-09 00:00:00.000", 4, "2020-07-15 23:59:59.999"],
            ["2020-07-15 23:59:59.999", 4, "2020-07-15 23:59:59.999"],
            ["2020-07-16 00:00:00.000", 4, "2020-07-22 23:59:59.999"],
            ["2020-07-09 23:59:59.999", 5, "2020-07-09 23:59:59.999"],
            ["2020-07-10 00:00:00.000", 5, "2020-07-16 23:59:59.999"],
            ["2020-07-16 23:59:59.999", 5, "2020-07-16 23:59:59.999"],
            ["2020-07-17 00:00:00.000", 5, "2020-07-23 23:59:59.999"],
            ["2020-07-10 23:59:59.999", 6, "2020-07-10 23:59:59.999"],
            ["2020-07-11 00:00:00.000", 6, "2020-07-17 23:59:59.999"],
            ["2020-07-17 23:59:59.999", 6, "2020-07-17 23:59:59.999"],
            ["2020-07-18 00:00:00.000", 6, "2020-07-24 23:59:59.999"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const firstDayOfWeek = values[1]
                const expected = new Date(values[2])
                const calendar = calendarFactory.create(base)
                calendar._firstDayOfWeek = firstDayOfWeek
                const actual = calendar.endOfWeek().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#endOfMonth", () => {
        [
            ["2019-12-31 23:59:59.999", "2019-12-31 23:59:59.999"],
            ["2020-01-01 00:00:00.000", "2020-01-31 23:59:59.999"],
            ["2020-01-31 23:59:59.999", "2020-01-31 23:59:59.999"],
            ["2020-02-01 00:00:00.000", "2020-02-29 23:59:59.999"],
            ["2020-02-29 23:59:59.999", "2020-02-29 23:59:59.999"],
            ["2020-03-01 00:00:00.000", "2020-03-31 23:59:59.999"],
            ["2020-03-31 23:59:59.999", "2020-03-31 23:59:59.999"],
            ["2020-04-01 00:00:00.000", "2020-04-30 23:59:59.999"],
            ["2020-04-30 23:59:59.999", "2020-04-30 23:59:59.999"],
            ["2020-05-01 00:00:00.000", "2020-05-31 23:59:59.999"],
            ["2020-05-31 23:59:59.999", "2020-05-31 23:59:59.999"],
            ["2020-06-01 00:00:00.000", "2020-06-30 23:59:59.999"],
            ["2020-06-30 23:59:59.999", "2020-06-30 23:59:59.999"],
            ["2020-07-01 00:00:00.000", "2020-07-31 23:59:59.999"],
            ["2020-07-31 23:59:59.999", "2020-07-31 23:59:59.999"],
            ["2020-08-01 00:00:00.000", "2020-08-31 23:59:59.999"],
            ["2020-08-31 23:59:59.999", "2020-08-31 23:59:59.999"],
            ["2020-09-01 00:00:00.000", "2020-09-30 23:59:59.999"],
            ["2020-09-30 23:59:59.999", "2020-09-30 23:59:59.999"],
            ["2020-10-01 00:00:00.000", "2020-10-31 23:59:59.999"],
            ["2020-10-31 23:59:59.999", "2020-10-31 23:59:59.999"],
            ["2020-11-01 00:00:00.000", "2020-11-30 23:59:59.999"],
            ["2020-11-30 23:59:59.999", "2020-11-30 23:59:59.999"],
            ["2020-12-01 00:00:00.000", "2020-12-31 23:59:59.999"],
            ["2020-12-31 23:59:59.999", "2020-12-31 23:59:59.999"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = new Date(values[1])
                const calendar = calendarFactory.create(base)
                const actual = calendar.endOfMonth().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#startOfYear", () => {
        [
            ["2019-12-31 23:59:59.999", "2019-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000", "2020-01-01 00:00:00.000"],
            ["2020-12-31 23:59:59.999", "2020-01-01 00:00:00.000"],
            ["2021-01-01 00:00:00.000", "2021-01-01 00:00:00.000"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = new Date(values[1])
                const calendar = calendarFactory.create(base)
                const actual = calendar.startOfYear().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#endOfYear", () => {
        [
            ["2019-12-31 23:59:59.999", "2019-12-31 23:59:59.999"],
            ["2020-01-01 00:00:00.000", "2020-12-31 23:59:59.999"],
            ["2020-12-31 23:59:59.999", "2020-12-31 23:59:59.999"],
            ["2021-01-01 00:00:00.000", "2021-12-31 23:59:59.999"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const expected = new Date(values[1])
                const calendar = calendarFactory.create(base)
                const actual = calendar.endOfYear().toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#advanceDays", () => {
        [
            ["2020-07-07 12:34:56", -3, "2020-07-04 12:34:56"],
            ["2020-07-07 12:34:56", -2, "2020-07-05 12:34:56"],
            ["2020-07-07 12:34:56", -1, "2020-07-06 12:34:56"],
            ["2020-07-07 12:34:56",  0, "2020-07-07 12:34:56"],
            ["2020-07-07 12:34:56",  1, "2020-07-08 12:34:56"],
            ["2020-07-07 12:34:56",  2, "2020-07-09 12:34:56"],
            ["2020-07-07 12:34:56",  3, "2020-07-10 12:34:56"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const days = values[1]
                const expected = new Date(values[2])
                const calendar = calendarFactory.create(base)
                const actual = calendar.advanceDays(days).toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#advanceMonths", () => {
        [
            ["2020-01-01 00:00:00.000", -3, "2019-10-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000", -2, "2019-11-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000", -1, "2019-12-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  0, "2020-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  1, "2020-02-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  2, "2020-03-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  3, "2020-04-01 00:00:00.000"],
            ["2020-01-31 23:59:59.999", -3, "2019-10-31 23:59:59.999"],
            ["2020-01-31 23:59:59.999", -2, "2019-11-30 23:59:59.999"],
            ["2020-01-31 23:59:59.999", -1, "2019-12-31 23:59:59.999"],
            ["2020-01-31 23:59:59.999",  0, "2020-01-31 23:59:59.999"],
            ["2020-01-31 23:59:59.999",  1, "2020-02-29 23:59:59.999"],
            ["2020-01-31 23:59:59.999",  2, "2020-03-31 23:59:59.999"],
            ["2020-01-31 23:59:59.999",  3, "2020-04-30 23:59:59.999"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const months = values[1]
                const expected = new Date(values[2])
                const calendar = calendarFactory.create(base)
                const actual = calendar.advanceMonths(months).toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#advanceYears", () => {
        [
            ["2020-01-01 00:00:00.000", -3, "2017-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000", -2, "2018-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000", -1, "2019-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  0, "2020-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  1, "2021-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  2, "2022-01-01 00:00:00.000"],
            ["2020-01-01 00:00:00.000",  3, "2023-01-01 00:00:00.000"],
            ["2020-02-29 12:34:56.789", -4, "2016-02-29 12:34:56.789"],
            ["2020-02-29 12:34:56.789", -3, "2017-02-28 12:34:56.789"],
            ["2020-02-29 12:34:56.789", -2, "2018-02-28 12:34:56.789"],
            ["2020-02-29 12:34:56.789", -1, "2019-02-28 12:34:56.789"],
            ["2020-02-29 12:34:56.789",  0, "2020-02-29 12:34:56.789"],
            ["2020-02-29 12:34:56.789",  1, "2021-02-28 12:34:56.789"],
            ["2020-02-29 12:34:56.789",  2, "2022-02-28 12:34:56.789"],
            ["2020-02-29 12:34:56.789",  3, "2023-02-28 12:34:56.789"],
            ["2020-02-29 12:34:56.789",  4, "2024-02-29 12:34:56.789"],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const years = values[1]
                const expected = new Date(values[2])
                const calendar = calendarFactory.create(base)
                const actual = calendar.advanceYears(years).toDate()
                assert.deepEqual(actual, expected)
            })
        })
    })

    describe("Calendar#year", () => {
        describe("値を取得する", () => {
            [
                ["2019-07-07 12:34:56.789", 2019],
                ["2020-07-07 12:34:56.789", 2020],
                ["2021-07-07 12:34:56.789", 2021],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.year()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2000-07-07 12:34:56.789", 2019, "2019-07-07 12:34:56.789"],
                ["2000-07-07 12:34:56.789", 2020, "2020-07-07 12:34:56.789"],
                ["2000-07-07 12:34:56.789", 2021, "2021-07-07 12:34:56.789"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const year = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.year(year).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#month", () => {
        describe("値を取得する", () => {
            [
                ["2020-01-07 12:34:56.789",  0],
                ["2020-07-07 12:34:56.789",  6],
                ["2020-12-07 12:34:56.789", 11],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.month()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2020-07-07 12:34:56.789",  0, "2020-01-07 12:34:56.789"],
                ["2020-07-07 12:34:56.789",  6, "2020-07-07 12:34:56.789"],
                ["2020-07-07 12:34:56.789", 11, "2020-12-07 12:34:56.789"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const month = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.month(month).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#date", () => {
        describe("値を取得する", () => {
            [
                ["2020-07-01 12:34:56.789",  1],
                ["2020-07-07 12:34:56.789",  7],
                ["2020-07-31 12:34:56.789", 31],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.date()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2020-07-07 12:34:56.789",  1, "2020-07-01 12:34:56.789"],
                ["2020-07-07 12:34:56.789",  8, "2020-07-08 12:34:56.789"],
                ["2020-07-07 12:34:56.789", 31, "2020-07-31 12:34:56.789"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const date = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.date(date).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#day", () => {
        describe("値を取得する", () => {
            [
                ["2020-07-05 12:34:56.789", 0],
                ["2020-07-06 12:34:56.789", 1],
                ["2020-07-07 12:34:56.789", 2],
                ["2020-07-08 12:34:56.789", 3],
                ["2020-07-09 12:34:56.789", 4],
                ["2020-07-10 12:34:56.789", 5],
                ["2020-07-11 12:34:56.789", 6],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.day()
                    assert.equal(actual, expected)
                })
            })
        })
    })

    describe("Calendar#hours", () => {
        describe("値を取得する", () => {
            [
                ["2020-07-07 00:34:56.789",  0],
                ["2020-07-07 12:34:56.789", 12],
                ["2020-07-07 23:34:56.789", 23],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.hours()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2020-07-07 12:34:56.789",  0, "2020-07-07 00:34:56.789"],
                ["2020-07-07 12:34:56.789", 13, "2020-07-07 13:34:56.789"],
                ["2020-07-07 12:34:56.789", 23, "2020-07-07 23:34:56.789"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const hours = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.hours(hours).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#minutes", () => {
        describe("値を取得する", () => {
            [
                ["2020-07-07 12:00:56.789",  0],
                ["2020-07-07 12:34:56.789", 34],
                ["2020-07-07 12:59:56.789", 59],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.minutes()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2020-07-07 12:34:56.789",  0, "2020-07-07 12:00:56.789"],
                ["2020-07-07 12:34:56.789", 30, "2020-07-07 12:30:56.789"],
                ["2020-07-07 12:34:56.789", 59, "2020-07-07 12:59:56.789"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const minutes = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.minutes(minutes).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#seconds", () => {
        describe("値を取得する", () => {
            [
                ["2020-07-07 12:34:00.789",  0],
                ["2020-07-07 12:34:56.789", 56],
                ["2020-07-07 12:34:59.789", 59],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.seconds()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2020-07-07 12:34:56.789",  0, "2020-07-07 12:34:00.789"],
                ["2020-07-07 12:34:56.789", 50, "2020-07-07 12:34:50.789"],
                ["2020-07-07 12:34:56.789", 59, "2020-07-07 12:34:59.789"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const seconds = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.seconds(seconds).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#milliseconds", () => {
        describe("値を取得する", () => {
            [
                ["2020-07-07 12:34:56.000",   0],
                ["2020-07-07 12:34:56.789", 789],
                ["2020-07-07 12:34:56.999", 999],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const expected = values[1]
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.milliseconds()
                    assert.equal(actual, expected)
                })
            })
        })
        describe("値を設定する", () => {
            [
                ["2020-07-07 12:34:56.789",   0, "2020-07-07 12:34:56.000"],
                ["2020-07-07 12:34:56.789",  70, "2020-07-07 12:34:56.070"],
                ["2020-07-07 12:34:56.789", 999, "2020-07-07 12:34:56.999"],
            ].forEach((values, index) => {
                it("#" + index, () => {
                    const base = new Date(values[0])
                    const milliseconds = values[1]
                    const expected = new Date(values[2])
                    const calendar = calendarFactory.create(base)
                    const actual = calendar.milliseconds(milliseconds).toDate()
                    assert.deepEqual(actual, expected)
                })
            })
        })
    })

    describe("Calendar#compare", () => {
        [
            ["2020-07-07 12:34:56.789", "2020-07-07 12:34:56.789",  0],
            ["2020-07-07 12:34:56.788", "2020-07-07 12:34:56.789", -1],
            ["2020-07-07 12:34:56.790", "2020-07-07 12:34:56.789",  1],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const target = new Date(values[1])
                const expected = values[2]
                const calendar = calendarFactory.create(base)
                const actual = calendar.compare(target)
                assert.equal(actual, expected)
            })
        })
    })

    describe("Calendar#compareTime", () => {
        [
            ["2020-07-07 12:34:56.789", 12, 34, 56, 789,  0],
            ["2020-07-07 12:34:56.788", 12, 34, 56, 789, -1],
            ["2020-07-07 12:34:56.790", 12, 34, 56, 789,  1],
        ].forEach((values, index) => {
            it("#" + index, () => {
                const base = new Date(values[0])
                const hours = values[1]
                const minutes = values[2]
                const seconds = values[3]
                const milliseconds = values[4]
                const expected = values[5]
                const calendar = calendarFactory.create(base)
                const actual = calendar.compareTime(hours, minutes, seconds, milliseconds)
                assert.equal(actual, expected)
            })
        })
    })

})

