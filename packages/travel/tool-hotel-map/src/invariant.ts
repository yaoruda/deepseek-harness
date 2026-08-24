import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-tool-hotel-map'
export const name = 'tool-hotel-map-invariant'
export const inject = ['invariants']

// No runtime invariant: the complete event is appended by the same tool call
// that creates its opaque id; focused execution tests observe that relation.
const install: InvariantInstaller = () => {}

/** Register package ownership; focused tests validate the event relation. */
export const apply = (ctx: Context): Promise<() => void> => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
