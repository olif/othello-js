import * as moment from 'moment'

type level = 'INFO' | 'WARN' | 'ERROR'

export function info (message: string) {
    logMessage('INFO', message)
}

export function warn (message: string) {
    logMessage('WARN', message)
}

export function error(message: string) {
    logMessage('ERROR', message)
}


const logMessage = function(level: level, message: string) {
    const dateStr = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(`[${dateStr}] - ${level}: ${message}`)
}
