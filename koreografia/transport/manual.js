// =====================================================================
//  manual.js -- the only complete Transport: a human in the loop
//
//  Emitted .txt files are handed to a `sink(fileName, text)` callback:
//  in node that writes to disk (tools/build.js), in the browser it
//  triggers a download (ui/app.js). The human then pastes each file into
//  whatever editor reaches the robot and presses Start by hand.
//
//  connect/send/broadcast/disconnect are accepted but only logged --
//  there is no link. This keeps the interface honest: code written
//  against Transport keeps working when a real transport appears.
// =====================================================================

import { Transport } from './transport.js';

export class ManualTransport extends Transport {
  /**
   * @param {(fileName: string, text: string) => void} sink
   * @param {(line: string) => void} [log]
   */
  constructor(sink, log = () => {}) {
    super();
    this.sink = sink;
    this.log = log;
    this.staged = new Map(); // robotId -> { fileName, text }
    this.connected = new Set();
  }

  /** Queue an emitted file for a robot. */
  stage(robotId, fileName, text) {
    this.staged.set(robotId, { fileName, text });
  }

  /** Hand every staged file to the sink. Returns the file names. */
  flush() {
    const names = [];
    for (const [, { fileName, text }] of this.staged) {
      this.sink(fileName, text);
      names.push(fileName);
    }
    this.staged.clear();
    return names;
  }

  async connect(robotId) {
    this.connected.add(robotId);
    this.log(`[manual] robot ${robotId}: nothing to connect -- paste the file by hand`);
  }

  async send(robotId, line) {
    this.log(`[manual] robot ${robotId}: would send "${line}" -- no link, do it on the Muszerfal`);
  }

  async broadcast(line) {
    for (const id of this.connected) await this.send(id, line);
  }

  async disconnect(robotId) {
    this.connected.delete(robotId);
  }
}

/** A sink for browsers: triggers a file download. */
export function browserDownloadSink(fileName, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
