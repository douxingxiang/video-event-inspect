/**
 * readyState and networkState
 */
const MAP_FIELDS = {
    readyState: {
        0: 'HAVE_NOTHING',
        1: 'HAVE_METADATA',
        2: 'HAVE_CURRENT_DATA',
        3: 'HAVE_FUTURE_DATA',
        4: 'HAVE_ENOUGH_DATA'
    },
    networkState: {
        0: 'NETWORK_EMPTY',
        1: 'NETWORK_IDLE',
        2: 'NETWORK_LOADING',
        3: 'NETWORK_NO_SOURCE'
    }
}

/**
 * All interested events
 */
const EVENT_LIST = 
(
    "abort error " + 
    //state change events
    "durationchange volumechange ratechange timeupdate ended " +
    //network loading events
    "emptied progress stalled suspend loadstart loadedmetadata loadeddata " +
    //decoder buffering events
    "canplay canplaythrough play playing waiting " + 
    //control events
    "pause seeking seeked waiting"
).split(' ');

/**
 * remember last video, filters and events
 */
let current_video_;
let current_events_;
let current_event_filters_;
let current_log_filters_

/**
 * inspect a video
 * @param {HTMLVideoElement} videoElement 
 * @param {Function} eventFilters 
 * @param {Function} logFilters 
 */
export function inspect(videoElement, eventFilters, logFilters)
{
    clear();

    if(videoElement && videoElement.tagName == 'VIDEO') {
        current_video_ = videoElement;
        current_event_filters_ = eventFilters || (type => { return true; });
        current_log_filters_ = logFilters || (type => { return true; });
    
        current_events_ = EVENT_LIST.filter(current_event_filters_);
        if(current_events_.length > 0) {
            current_events_.map( type => {
                current_video_.addEventListener(type, print);
            });
        }
    }

}

/**
 * clear video inpsect
 */
export function clear()
{
    if(current_video_ && current_events_.length > 0) {
        current_events_.map( type => {
            current_video_.removeEventListener(type, print);
        })
    }
}

const NORMAL_FIELDS = "volume muted playbackRate currentTime duration paused ended".split(' ');
const STATE_FIELDS = 'readyState networkState'.split(' ');
const TIME_RANGE_FIELDS = 'buffered played seekable'.split(' ');
/**
 * save for diff
 */
let last_log_;
function print(e)
{
    let type = e.type,
        stamp = e.timeStamp;
    let current = [];
    //volume muted playbackRate currentTime duration paused ended
    // autoplay error controls loop
    //readyState, networkState
    //buffered, played, seekable

    current.push(`${type}@${stamp}\n`);
    let normal_fields = NORMAL_FIELDS.filter(current_log_filters_),
        state_fields = STATE_FIELDS.filter(current_log_filters_),
        timerange_fields = TIME_RANGE_FIELDS.filter(current_log_filters_);
    if(normal_fields.length > 0) {
        normal_fields.map( field => {
            current.push(`${field}(${current_video_[field]})`);
        });
        current.push('\n');
    }

    if(state_fields.length > 0) {
        state_fields.map( field => {
            let v = current_video_[field];
            current.push(`${field}(${v}, ${MAP_FIELDS[field][v]})`);
        });
        current.push('\n');
    }
    if(timerange_fields.length > 0) {
        timerange_fields.map( field => {
            let v = current_video_[field];
            let ranges = [];
            for(let i = 0; i < v.length; i++) {
                ranges.push(`${v.start(i)}-${v.end(i)}`)
            }
            current.push(`${field}(${ranges.join('|')})`);
        });
        current.push('\n');
    }

    let output = [],
        colors_ = [];
    for(let i = 0; i < current.length; i++) {
        output.push(`%c${current[i]}`);
        if(!last_log_ || last_log_[i] != current[i]) {
            colors_.push(`color:red`);
        }
        else {
            colors_.push(`color:unset`);
        }
    }
    console.log.apply(console, [output.join(',')].concat(colors_));

    last_log_ = current;
}