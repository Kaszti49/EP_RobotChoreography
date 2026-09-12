// =====================================================================
//  transport.js -- how emitted code and commands reach a robot
//
//  Abstract. The real wire protocol is only partly known (see
//  README.md in this directory), so the only complete implementation
//  is manual.js: files on disk / browser downloads, pasted by a human.
// =====================================================================

export class Transport {
  /** Open a link to one robot. */
  async connect(robotId) { throw new Error('not implemented'); }

  /** Send one text line (no trailing newline needed) to one robot. */
  async send(robotId, line) { throw new Error('not implemented'); }

  /** Send one text line to every connected robot. */
  async broadcast(line) { throw new Error('not implemented'); }

  /** Close the link to one robot. */
  async disconnect(robotId) { throw new Error('not implemented'); }
}
