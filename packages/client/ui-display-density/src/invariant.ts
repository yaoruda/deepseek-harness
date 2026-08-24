/** Package invariant companion for browser-local display density. */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-display-density'

/** Cordis companion plugin name. */
export const name = 'client-ui-display-density-invariant'
/** Service required before package ownership can be reserved. */
export const inject = ['invariants']

/**
 * No runtime invariant: the preference has no event or service relationship;
 * package tests pin storage validation, document projection, and slot disposal.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
