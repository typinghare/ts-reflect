import { isNull, isUndefined } from 'lodash'

export const defaultToCall = function <T>(value: T | undefined | null, callback: () => T): T {
    if (!isUndefined(value) && !isNull(value)) {
        return value
    }

    return callback()
}
