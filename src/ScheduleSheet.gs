
class ScheduleSheet {

    /**
     *
     * Sheet を取得または作成する.
     *
     * @param {string} sheetName
     *     Sheet の名前.
     *
     * @param {number} initialRows
     *     Sheet を作成する場合のヘッダを除く行数.
     *
     * @return {Sheet}
     *     sheetName で指定された Sheet.
     *     存在しない場合は新しく作成した Sheet.
     *
     */
    static _getOrCreateSheet(sheetName, initialRows) {
        function getSheet() {
            const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
            return spreadsheet.getSheetByName(sheetName)
        }
        function createSheet() {
            // TODO this.Creator にしたかった.
            return ScheduleSheet.Creator.create(sheetName, initialRows)
        }
        return getSheet() || createSheet()
    }

    static _getFrequencyMap() {
        const map = new Map()
        map.set("単発<YYYY-MM-DD HH:MM>", Frequency.Once)
        map.set("毎日<HH:MM>", Frequency.Daily)
        map.set("毎営業日<HH:MM>", Frequency.DailyBusinessDay)
        map.set("毎週<DOW>曜日<HH:MM>", Frequency.WeeklyNthDay)
        map.set("毎週第<N>営業日<HH:MM>", Frequency.WeeklyNthBusinessDay)
        map.set("毎月第<N>日<HH:MM>", Frequency.MonthlyNthDay)
        map.set("毎月第<N>営業日<HH:MM>", Frequency.MonthlyNthBusinessDay)
        map.set("毎月第<N><DOW>曜日<HH:MM>", Frequency.MonthlyNthDow)
        map.set("毎月第<N><DOW>曜営業日<HH:MM>", Frequency.MonthlyNthDowBusinessDay)
        map.set("毎年第<N>日<HH:MM>", Frequency.YearlyNthDay)
        map.set("毎年第<N>営業日<HH:MM>", Frequency.YearlyNthBusinessDay)
        map.set("毎年第<N><DOW>曜日<HH:MM>", Frequency.YearlyNthDow)
        map.set("毎年第<N><DOW>曜営業日<HH:MM>", Frequency.YearlyNthDowBusinessDay)
        return map
    }

    static _getDayOfWeekMap() {
        // Date.getDay() と同じ値とする.
        const map = new Map()
        map.set("日曜日", 0)
        map.set("月曜日", 1)
        map.set("火曜日", 2)
        map.set("水曜日", 3)
        map.set("木曜日", 4)
        map.set("金曜日", 5)
        map.set("土曜日", 6)
        return map
    }

    /**
     *
     * インスタンスを構築する.
     *
     * @param {string} sheetName
     *     Sheet の名前.
     *
     * @param {number} initialRows
     *     Sheet を作成する場合のヘッダを除く行数.
     *
     */
    constructor(sheetName, initialRows) {
        this.sheet = this.constructor._getOrCreateSheet(sheetName, initialRows)
    }

    /**
     *
     * Schedule を読み込む.
     *
     * @return {Array.<Schedule>}
     *     Sheet から読み込んだ Schedule.
     *
     */
    loadSchedules() {
        return this.constructor.Loader.load(this.sheet)
    }

    /**
     *
     * Schedule を保存する.
     *
     * @param {Array.<Schedule>} schedules
     *     保存する Schedule.
     *
     */
    saveSchedules(schedules) {
        schedules.forEach((schedule, index) => {
            if(!schedule.isValid() || !schedule.enabled) {
                return
            }
            const row = index + 2
            const range = this.sheet.getRange(row, 11, 1, 2)
            const last = schedule.last
            const next = schedule.next
            range.setValues([[last, next]])
        }, this)
    }

}

ScheduleSheet.Loader = class {

    static load(sheet) {
        const range = sheet.getDataRange()
        const dictionaries = this._getTableAsTextDictionaries(range)
        const schedules = dictionaries.map(dictionary => this._scheduleFromDictionary(dictionary))
        return schedules
    }

    /**
     *
     * Range の内容をテキストの辞書配列として取得する.
     *
     * @param {Range} range
     *     値を取得する範囲.
     *
     * @return {Array.<object>}
     *     range の 1 行目をキーとした辞書の配列.
     *
     */
    static _getTableAsTextDictionaries(range) {
        const values = range.getValues()
        const dictionaries = []

        for (let row = 1; row < range.getNumRows(); row++) {
            const dictionary = {}
            for (let column = 0; column < range.getNumColumns(); column++) {
                dictionary[values[0][column]] = values[row][column]
            }
            dictionaries.push(dictionary)
        }
        return dictionaries
    }

    static _scheduleFromDictionary(dictionary) {
        const title = dictionary["名称"]
        const owner = dictionary["オーナー"]
        const enabled = (dictionary["有効"] === "no")
        const last = this._toDate(dictionary["最終通知日時"])
        const next = this._toDate(dictionary["次回通知日時"])
        const frequency = this._frequencyFromDictionary(dictionary)
        const destination = this._destinationFromDictionary(dictionary)
        return new Schedule(title, owner, enabled, last, next, frequency, destination)
    }

    static _frequencyFromDictionary(dictionary) {
        const pattern = dictionary["頻度パターン"]
        const nth = this._toNth(dictionary["<N>"])
        const dow = this._toDow(dictionary["<DOW>"])
        const hours = this._toHours(dictionary["<HH:MM>"])
        const minutes = this._toMinutes(dictionary["<HH:MM>"])
        const datetime = this._toDate(dictionary["<YYYY-MM-DD HH:MM>"])
        const frequencyMap = ScheduleSheet._getFrequencyMap()
        const frequencyClass = frequencyMap.get(pattern)
        if(!frequencyClass) {
            return null
        }
        try {
            return new frequencyClass(nth, dow, hours, minutes, datetime)
        } catch(exception) {
            return null
        }
    }

    static _destinationFromDictionary(dictionary) {
        const destination = {
            slackChannelId: dictionary["Slack チャネル"],
            message: dictionary["本文"],
        }
        return destination
    }

    static _toNth(value) {
        if(value === null || value === "") {
            return null
        }
        return Number(value)
    }

    static _toDow(value) {
        const map = ScheduleSheet._getDayOfWeekMap()
        if(!(map.has(value))) {
            return null
        }
        return map.get(value)
    }

    static _toHours(value) {
        if(!value) {
            return null
        }
        return value.getHours()
    }

    static _toMinutes(value) {
        if(!value) {
            return null
        }
        return value.getMinutes()
    }

    static _toDate(value) {
        if(!value) {
            return null
        }
        return new Date(value)
    }

}

ScheduleSheet.Creator = class {

    static create(sheetName, numRows) {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
        const sheet = spreadsheet.insertSheet(sheetName)
        this._initializeSheet(sheet, numRows)
        return sheet
    }

    static _initializeSheet(sheet, numRows) {
        this._getColumnInitializers().forEach((initializer, index) => {
            const column = index + 1
            initializer(sheet, column, numRows)
        })
    }

    static _getColumnInitializers() {
        function _newDataValidation(values) {
            const validation = SpreadsheetApp.newDataValidation()
            return validation.requireValueInList(values).setAllowInvalid(false).build()
        }
        return [
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("No.")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("=ROW() - 1")
                    value.setNumberFormat("0")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("名称")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("@")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("オーナー")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("@")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("有効")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.insertCheckboxes("no")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("頻度")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    // NOTE 配列中の順序を変更する場合は手で修正する必要がある.
                    //      条件式で指定しているセルの位置を決め打ちで記述しているため.
                    value.setValue(
                        '=IF(\n' +
                        '    AND(\n' +
                        '        NOT(ISBLANK(F2)),\n' +
                        '        OR(NOT(ISNUMBER(FIND("<N>", F2))), NOT(ISBLANK(G2))),\n' +
                        '        OR(NOT(ISNUMBER(FIND("<DOW>", F2))), NOT(ISBLANK(H2))),\n' +
                        '        OR(NOT(ISNUMBER(FIND("<HH:MM>", F2))), NOT(ISBLANK(I2))),\n' +
                        '        OR(NOT(ISNUMBER(FIND("<YYYY-MM-DD HH:MM>", F2))), NOT(ISBLANK(J2)))),\n' +
                        '    SUBSTITUTE(\n' +
                        '        SUBSTITUTE(\n' +
                        '            SUBSTITUTE(\n' +
                        '                SUBSTITUTE(F2, "<N>", G2),\n' +
                        '                "<DOW>",\n' +
                        '                SUBSTITUTE(H2, "曜日", "")\n' +
                        '            ),\n' +
                        '            "<HH:MM>",\n' +
                        '            I2),\n' +
                        '        "<YYYY-MM-DD HH:MM>",\n' +
                        '        J2),\n' +
                        '    "")')
                    value.setNumberFormat("@")
                    value.setBackground("lightgray")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("頻度パターン")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    const patterns = Array.from(ScheduleSheet._getFrequencyMap().keys())
                    const validation = _newDataValidation(patterns)
                    value.setDataValidation(validation)
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("<N>")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("0")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("<DOW>")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("@")
                    const dowNames = Array.from(ScheduleSheet._getDayOfWeekMap().keys())
                    const validation = _newDataValidation(dowNames)
                    value.setDataValidation(validation)
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("<HH:MM>")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("hh:mm")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("<YYYY-MM-DD HH:MM>")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("yyyy-mm-dd hh:mm")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("最終通知日時")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("yyyy-mm-dd hh:mm")
                    value.setBackground("lightgray")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("次回通知日時")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("yyyy-mm-dd hh:mm")
                    value.setBackground("lightgray")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("Slack チャネル")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("@")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
            function(sheet, column, numRows) {
                const header = sheet.getRange(1, column)
                header.setValue("本文")
                if(numRows > 0) {
                    const value = sheet.getRange(2, column)
                    value.setValue("")
                    value.setNumberFormat("@")
                    const values = sheet.getRange(3, column, numRows - 1)
                    value.copyTo(values)
                }
            },
        ]
    }

}

