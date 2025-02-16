'use strict'
function uuid(
  a                  // placeholder
){
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        uuid         // random hex digits
      )
}


/*    understand/
 * The current Hybric Logical Clock
 */
let hlc

/*    outcome/
 * Initialize the clock to start
 */
function init() {
  hlc = {
    ts: Date.now(),
    nn: 0,
    id: uuid()
  }
}

/*    outcome/
 * This is the 'increment' function of a hybrid logical clock - we
 * adjust the current clock either with the latest timestamp or with an
 * incremented counter and return a serialized value
 */
function nxt() {
  try {
    hlc = inc(hlc)
    return serial(hlc)
  } catch(e) {
    console.error(e)
  }
}

function inc(my) {
  let now = Date.now()
  if(now > my.ts) {
    return { id: my.id, ts: now, nn: 0 }
  } else {
    return { id: my.id, ts: my.ts, nn: my.nn+1 }
  }
}

function serial(hlc) {
  return `${hlc.ts}:${hlc.nn}:${hlc.id}`
}

function parse(hlc) {
  let p = hlc.split(':')
  return {
    ts: parseInt(p[0]),
    nn: parseInt(p[1]),
    id: p[2],
  }
}

/*    outcome/
 * This is the 'receive' function of a hybrid logical clock - we parse
 * the remote hlc and adjust the current clock with the latest timestamp
 * or the newly received clock whichever wins
 */
function recv(remote) {
  try {
    remote = parse(remote)
    hlc = receive(remote, hlc)
    return serial(hlc)
  } catch(e) {
    console.error(e)
  }
}

function receive(remote, my) {
  let now = Date.now()
  if(now > my.ts && now > remote.ts) {
    return { id: my.id, ts: now, nn: 0 }
  }
  if(my.ts == remote.ts) {
    let nn = Math.max(my.nn, remote.nn) + 1
    return { id: my.id, ts: my.ts, nn }
  }

  if(remote.ts > hlc.ts) {
    return { id: my.id, ts: remote.ts, nn: remote.nn + 1 }
  }

  return { id: my.id, ts: my.ts, nn: my.nn + 1 }
}

init()

module.exports = {
  nxt,
  recv,
}
