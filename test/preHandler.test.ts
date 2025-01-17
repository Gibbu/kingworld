import KingWorld, { type Plugin } from '../src'

import { describe, expect, it } from 'bun:test'

const req = (path: string) => new Request(path)

describe('preHandler', () => {
	it('Globally skip main handler', async () => {
		const app = new KingWorld()
			.preHandler<{
				params: {
					name?: string
				}
			}>(({ params: { name } }) => {
				if (name === 'Fubuki') return 'Cat'
			})
			.get<{
				params: {
					name: string
				}
			}>('/name/:name', ({ params: { name } }) => name)

		const res = await app.handle(req('/name/Fubuki'))

		expect(await res.text()).toBe('Cat')
	})

	it('Locally skip main handler', async () => {
		const app = new KingWorld().get<{
			params: {
				name: string
			}
		}>('/name/:name', ({ params: { name } }) => name, {
			preHandler: ({ params: { name } }) => {
				if (name === 'Fubuki') return 'Cat'
			}
		})

		const res = await app.handle(req('/name/Fubuki'))

		expect(await res.text()).toBe('Cat')
	})

	it('Group pre handle', async () => {
		const app = new KingWorld()
			.group('/type', (app) =>
				app
					.preHandler<{
						params: {
							name?: string
						}
					}>(({ params: { name } }) => {
						if (name === 'Fubuki') return 'Cat'
					})
					.get<{
						params: {
							name: string
						}
					}>('/name/:name', ({ params: { name } }) => name)
			)
			.get<{
				params: {
					name: string
				}
			}>('/name/:name', ({ params: { name } }) => name)

		const base = await app.handle(req('/name/Fubuki'))
		const scoped = await app.handle(req('/type/name/Fubuki'))

		expect(await base.text()).toBe('Fubuki')
		expect(await scoped.text()).toBe('Cat')
	})

	it('Pre handle from plugin', async () => {
		const transformId: Plugin = (app) =>
			app.preHandler<{
				params: {
					name?: string
				}
			}>(({ params: { name } }) => {
				if (name === 'Fubuki') return 'Cat'
			})

		const app = new KingWorld().use(transformId).get<{
			params: {
				name: string
			}
		}>('/name/:name', ({ params: { name } }) => name)

		const res = await app.handle(req('/name/Fubuki'))

		expect(await res.text()).toBe('Cat')
	})

	it('Pre handle in order', async () => {
		const app = new KingWorld()
			.get<{
				params: {
					name: string
				}
			}>('/name/:name', ({ params: { name } }) => name)
			.preHandler<{
				params: {
					name?: string
				}
			}>(({ params: { name } }) => {
				if (name === 'Fubuki') return 'Cat'
			})

		const res = await app.handle(req('/name/Fubuki'))

		expect(await res.text()).toBe('Fubuki')
	})

	it('Globally and locally pre handle', async () => {
		const app = new KingWorld()
			.preHandler<{
				params: {
					name?: string
				}
			}>(({ params: { name } }) => {
				if (name === 'Fubuki') return 'Cat'
			})
			.get<{
				params: {
					name: string
				}
			}>('/name/:name', ({ params: { name } }) => name, {
				preHandler: ({ params: { name } }) => {
					if (name === 'Korone') return 'Dog'
				}
			})

		const fubuki = await app.handle(req('/name/Fubuki'))
		const korone = await app.handle(req('/name/Korone'))

		expect(await fubuki.text()).toBe('Cat')
		expect(await korone.text()).toBe('Dog')
	})

	it('Accept multiple pre handler', async () => {
		const app = new KingWorld()
			.preHandler<{
				params: {
					name?: string
				}
			}>(({ params: { name } }) => {
				if (name === 'Fubuki') return 'Cat'
			})
			.preHandler<{
				params: {
					name?: string
				}
			}>(({ params: { name } }) => {
				if (name === 'Korone') return 'Dog'
			})
			.get<{
				params: {
					name: string
				}
			}>('/name/:name', ({ params: { name } }) => name)

		const fubuki = await app.handle(req('/name/Fubuki'))
		const korone = await app.handle(req('/name/Korone'))

		expect(await fubuki.text()).toBe('Cat')
		expect(await korone.text()).toBe('Dog')
	})

	it('Handle async', async () => {
		const app = new KingWorld().get<{
			params: {
				name: string
			}
		}>('/name/:name', ({ params: { name } }) => name, {
			preHandler: async ({ params: { name } }) => {
				await new Promise<void>((resolve) =>
					setTimeout(() => {
						resolve()
					}, 1)
				)

				if (name === 'Watame') return 'Warukunai yo ne'
			}
		})

		const res = await app.handle(req('/name/Watame'))

		expect(await res.text()).toBe('Warukunai yo ne')
	})
})
