// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {TestP} from '../test';
import {GoldenText} from '../goldenText';

export function addTests(testRunner) {
  // @ts-ignore unused variables xit/fit.
  const {it, xit, fit} = testRunner;

  it('threadsOnPause', async({p} : {p: TestP}) => {
    p.launch('<script>debugger;</script>');
    await p.dap.once('stopped');
    p.log(await p.dap.threads({}));
    p.assertLog();
  });

  it('threadsNotOnPause', async({p}: {p: TestP}) => {
    await p.launch('blank');
    p.log(await p.dap.threads({}));
    p.assertLog();
  });
}

export function addStartupTests(testRunner) {
  // @ts-ignore unused variables xit/fit.
  const {it, xit, fit} = testRunner;

  it('threadEventOnStartup', async({goldenText}: {goldenText: GoldenText}) => {
    const p = new TestP(goldenText);
    p.dap.on('thread', e => p.log(e, 'Thread event: '));

    p.log('Initializing');
    // Initializing does not create a thread.
    await p.initialize;

    p.log('Launching');
    // One thread during launch.
    const launch = p.launch('blank');
    await p.dap.once('thread');

    p.log('Requesting threads');
    p.log(await p.dap.threads({}));

    await launch;
    p.log('Launched, requesting threads');
    p.log(await p.dap.threads({}));

    p.log('Disconnecting');
    await p.disconnect();
    p.assertLog();
  });
}
