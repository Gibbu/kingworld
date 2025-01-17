import KingWorld from '../src'

const app = new KingWorld()
	.get('/', ({ responseHeaders }) => {
		responseHeaders.append('X-POWERED-BY', 'KingWorld')

		return new Response('Shuba Shuba', {
			headers: {
				duck: 'shuba duck'
			},
			status: 418
		})
	})
	.listen(8080)
