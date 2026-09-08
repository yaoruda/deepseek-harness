import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-hotel-map'
export const name = 'client-ui-hotel-map-invariant'
export const inject = ['invariants']
// No runtime invariant: the browser-only Definition and renderer registrations
// are effect-owned and client composition tests prove disposal.
const install: InvariantInstaller = () => {}
/** Register package ownership; client replay tests own the visible relationship. */
export const apply = (ctx: Context): Promise<() => void> => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
