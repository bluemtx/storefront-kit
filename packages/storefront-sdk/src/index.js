/**
 * @typedef {Object} StorefrontClientOptions
 * @property {string} [baseUrl] - API origin (e.g. https://commerce.example.com). Empty string = same-origin (Worker BFF).
 * @property {string} storeSlug - Public store slug
 * @property {typeof fetch} [fetch] - Optional fetch implementation
 * @property {Record<string, string>} [headers] - Extra headers
 * @property {() => string | null | undefined} [getCustomerToken]
 * @property {() => string | null | undefined} [getAcceptLanguage]
 */

/**
 * @typedef {Object} StorefrontConfig
 * @property {string} slug
 * @property {string|null} name
 * @property {object} [storefront]
 * @property {object} [brand_system]
 * @property {object} [capabilities]
 */

/**
 * Encode nested query objects the way Laravel expects (`opt[color]=red`).
 * @param {URLSearchParams} params
 * @param {string} key
 * @param {unknown} value
 */
function appendQuery(params, key, value) {
  if (value === undefined || value === null || value === '') {
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      appendQuery(params, `${key}[${index}]`, entry)
    })
    return
  }
  if (typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      appendQuery(params, `${key}[${childKey}]`, childValue)
    }
    return
  }
  params.append(key, String(value))
}

/**
 * Resolve public API root.
 * - baseUrl empty → same-origin `/api/v1/stores/{slug}` (Cloudflare Worker BFF)
 * - baseUrl set → `{origin}/api/v1/stores/{slug}` (direct Commerce or absolute Worker host)
 *
 * @param {string} baseUrl
 * @param {string} storeSlug
 */
export function storefrontApiRoot(baseUrl, storeSlug) {
  const origin = String(baseUrl || '').replace(/\/$/, '')
  const slug = String(storeSlug || '').replace(/^\/+|\/+$/g, '')
  const path = `/api/v1/stores/${encodeURIComponent(slug)}`
  return origin ? `${origin}${path}` : path
}

/**
 * Typed client for BlueMTX Storefront Public API.
 * Expand only with public `/api/v1/stores/{slug}/*` routes — never admin/ERP shapes.
 */
export function createStorefrontClient(options) {
  const baseUrl = String(options.baseUrl ?? '')
  const storeSlug = String(options.storeSlug || '').replace(/^\/+|\/+$/g, '')
  const fetchImpl = options.fetch || globalThis.fetch
  const extraHeaders = options.headers || {}

  if (!storeSlug) {
    throw new Error('@bluemtx/storefront-sdk: storeSlug is required')
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('@bluemtx/storefront-sdk: fetch is not available')
  }

  const root = storefrontApiRoot(baseUrl, storeSlug)

  /**
   * @param {string} path
   * @param {RequestInit} [init]
   */
  async function request(path, init = {}) {
    const headers = {
      Accept: 'application/json',
      ...extraHeaders,
      ...(init.headers || {}),
    }

    const token = typeof options.getCustomerToken === 'function'
      ? options.getCustomerToken()
      : null
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const locale = typeof options.getAcceptLanguage === 'function'
      ? options.getAcceptLanguage()
      : null
    if (locale && !headers['Accept-Language']) {
      headers['Accept-Language'] = locale
    }

    if (init.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetchImpl(`${root}${path}`, {
      ...init,
      headers,
    })

    const text = await response.text()
    let payload = null
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { message: text }
      }
    }

    if (!response.ok) {
      const error = new Error(payload?.message || `Storefront API ${response.status}`)
      error.status = response.status
      error.payload = payload
      throw error
    }

    return payload?.data !== undefined ? payload.data : payload
  }

  /**
   * @param {Record<string, unknown>} [query]
   */
  function withQuery(path, query = {}) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      appendQuery(params, key, value)
    }
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
  }

  return {
    /**
     * Low-level escape hatch for paths not yet wrapped as named methods.
     * Prefer named methods in application code.
     * @param {string} path
     * @param {RequestInit} [init]
     */
    request,

    // --- Config -------------------------------------------------------------

    /** @returns {Promise<StorefrontConfig>} */
    getConfig() {
      return request('/config')
    },

    /**
     * Prefer the versioned public contract envelope when present.
     * @returns {Promise<object>}
     */
    async getStorefrontContract() {
      const config = await this.getConfig()
      if (config?.storefront && typeof config.storefront === 'object') {
        return config.storefront
      }
      return {
        schema_version: 1,
        store: {
          slug: config?.slug,
          name: config?.name,
          base_currency: config?.base_currency,
        },
        brand: config?.brand_system || { assets: config?.brand },
        locale: {
          current: config?.locale,
          default: config?.default_locale,
          enabled: config?.enabled_locales,
          languages: config?.languages,
        },
        capabilities: {
          customization: config?.capabilities || {},
        },
        composition: {
          homepage: config?.homepage,
          store_layout: config?.store_layout,
        },
        extensions: [],
      }
    },

    // --- Catalog ------------------------------------------------------------

    listCollections() {
      return request('/collections')
    },

    getCollection(slug) {
      return request(`/collections/${encodeURIComponent(slug)}`)
    },

    /**
     * @param {Record<string, unknown>} [query]
     */
    listCatalog(query = {}) {
      return request(withQuery('/catalog', query))
    },

    /**
     * @param {Record<string, unknown>} [query]
     */
    listCatalogFacets(query = {}) {
      return request(withQuery('/catalog/facets', query))
    },

    getProduct(productSlug) {
      return request(`/products/${encodeURIComponent(productSlug)}`)
    },

    // --- Content ------------------------------------------------------------

    listPages() {
      return request('/pages')
    },

    getPage(slug) {
      return request(`/pages/${encodeURIComponent(slug)}`)
    },

    // --- Cart ---------------------------------------------------------------

    getCart(sessionToken) {
      return request('/cart', {
        method: 'POST',
        body: JSON.stringify({ session_token: sessionToken || null }),
      })
    },

    /**
     * @param {{ session_token?: string|null, item_id: string, quantity?: number, [key: string]: unknown }} payload
     */
    addCartItem(payload) {
      return request('/cart/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    /**
     * @param {string} lineId
     * @param {{ session_token?: string|null, quantity: number }} payload
     */
    updateCartItem(lineId, payload) {
      return request(`/cart/items/${encodeURIComponent(lineId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },

    /**
     * @param {string} lineId
     * @param {{ session_token?: string|null }} [payload]
     */
    removeCartItem(lineId, payload = {}) {
      return request(`/cart/items/${encodeURIComponent(lineId)}`, {
        method: 'DELETE',
        body: JSON.stringify(payload),
      })
    },

    // --- Wishlist -----------------------------------------------------------

    /**
     * @param {{ session_token?: string|null }} [query]
     */
    getWishlist(query = {}) {
      return request(withQuery('/wishlist', query))
    },

    /**
     * @param {{ listing_id: string, session_token?: string|null }} payload
     */
    addWishlistItem(payload) {
      return request('/wishlist/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    /**
     * @param {string} listingId
     * @param {{ session_token?: string|null }} [query]
     */
    removeWishlistItem(listingId, query = {}) {
      return request(withQuery(`/wishlist/items/${encodeURIComponent(listingId)}`, query), {
        method: 'DELETE',
      })
    },

    // --- Auth ---------------------------------------------------------------

    /**
     * @param {string} email
     * @param {string} password
     * @param {{ wishlist_session_token?: string|null }} [extra]
     */
    login(email, password, extra = {}) {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, ...extra }),
      })
    },

    register(payload) {
      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    logout() {
      return request('/auth/logout', { method: 'POST', body: JSON.stringify({}) })
    },

    forgotPassword(email) {
      return request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    },

    resetPassword(payload) {
      return request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    // --- Account ------------------------------------------------------------

    getAccount() {
      return request('/account')
    },

    updateProfile(payload) {
      return request('/account/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },

    updatePassword(payload) {
      return request('/account/password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },

    listAddresses() {
      return request('/account/addresses')
    },

    createAddress(payload) {
      return request('/account/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    updateAddress(addressId, payload) {
      return request(`/account/addresses/${encodeURIComponent(addressId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },

    deleteAddress(addressId) {
      return request(`/account/addresses/${encodeURIComponent(addressId)}`, {
        method: 'DELETE',
      })
    },

    listOrders() {
      return request('/account/orders')
    },

    getOrder(orderId) {
      return request(`/account/orders/${encodeURIComponent(orderId)}`)
    },

    // --- Checkout / guest orders --------------------------------------------

    getCheckoutOptions() {
      return request('/checkout-options')
    },

    checkout(payload) {
      return request('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    /**
     * Guest order confirmation (signed query required by Commerce).
     * @param {string} orderId
     * @param {{ expires: string|number, signature: string }} query
     */
    getGuestOrder(orderId, query) {
      return request(withQuery(`/orders/${encodeURIComponent(orderId)}`, query))
    },

    /**
     * @param {string} orderId
     * @param {Record<string, unknown>} payload
     * @param {{ expires?: string|number, signature?: string }} [query]
     */
    createPaymentSession(orderId, payload, query = {}) {
      return request(withQuery(`/orders/${encodeURIComponent(orderId)}/payment-session`, query), {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    trackOrder(payload) {
      return request('/orders/track', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  }
}

export const STOREFRONT_SDK_VERSION = '0.2.4'
