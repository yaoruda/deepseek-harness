/** Package invariant companion for browser-local fixed skin presets. */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-skin-presets'

/** Cordis companion plugin name. */
export const name = 'client-ui-skin-presets-invariant'
/** Service required before package ownership can be reserved. */
export const inject = ['invariants']

/**
 * No runtime invariant: package tests pin theme registration, projection,
 * persistence, settings composition, and disposal.
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
