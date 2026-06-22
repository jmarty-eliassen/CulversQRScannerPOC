// In development, intercept a small set of API calls for local mocking.
// This service worker will handle POST /api/redeem by randomly returning one of
// two mock responses located under /mocks/valid.json and /mocks/invalid.json.
self.addEventListener('fetch', event => {
	try {
		const url = new URL(event.request.url);

		if (url.pathname === '/api/redeem' && event.request.method === 'POST') {
			event.respondWith((async () => {
				// Read request body to simulate realistic behavior (not used here)
				try {
					await event.request.clone().json();
				} catch { }

				// Randomly pick one of the two mock endpoints
				const pick = Math.random() < 0.5 ? '/mocks/valid.json' : '/mocks/invalid.json';
				const res = await fetch(pick, { cache: 'no-store' });
				const body = await res.text();
				return new Response(body, {
					status: res.status,
					headers: { 'Content-Type': 'application/json' }
				});
			})());
			return;
		}
	} catch (e) {
		// fall through to default
	}

	// Default: do not intercept other requests in dev mode
});
