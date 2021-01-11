/**
 *
 * Trigger に関する操作を提供する.
 *
 */
class Triggers {

    /**
     *
     * 指定した関数をハンドラとする Trigger を取得する.
     *
     * @param {string|null} handlerFunctionName
     *     ハンドラとする関数の名前.
     *     省略した場合は全て Trigger を取得する.
     *
     * @return {Array.<Trigger>}
     *     Trigger の配列.
     *
     */
    static getProjectTriggers(handlerFunctionName) {
        function isTarget(trigger) {
            if(handlerFunctionName == null) {
                return true
            }
            return handlerFunctionName === trigger.getHandlerFunction()
        }
        return ScriptApp.getProjectTriggers().filter(isTarget)
    }

    /**
     *
     * 指定した関数をハンドラとする Project Trigger を削除する.
     *
     * @param {string|null} handlerFunctionName
     *     ハンドラとする関数の名前.
     *     省略した場合は全て Trigger を削除する.
     *
     */
    static deleteProjectTriggers(handlerFunctionName) {
        const triggers = this.getProjectTriggers(handlerFunctionName)
        triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger))
    }

}

