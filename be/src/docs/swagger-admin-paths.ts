/**
 * @swagger
 * /api/v1/admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: List all products (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, suspended, archived]
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     tags: [Admin]
 *     summary: Create a new product
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Slug already exists
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Admin]
 *     summary: Delete (archive) a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product archived
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: List categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Category list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Admin]
 *     summary: Create a category
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9-]+$'
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *               sort_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created
 *       409:
 *         description: Slug already exists
 */

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deactivated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Category has products, cannot delete
 */

/**
 * @swagger
 * /api/v1/admin/insurers:
 *   get:
 *     tags: [Admin]
 *     summary: List insurers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Insurer list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Insurer'
 *   post:
 *     tags: [Admin]
 *     summary: Create an insurer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, slug]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Insurer created
 *       409:
 *         description: Code or slug already exists
 */

/**
 * @swagger
 * /api/v1/admin/customers:
 *   get:
 *     tags: [Admin]
 *     summary: List customers (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *     responses:
 *       200:
 *         description: Paginated customer list
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/v1/admin/customers/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update customer status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomerStatusRequest'
 *     responses:
 *       200:
 *         description: Customer status updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     summary: List available products (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *       - in: query
 *         name: insurer
 *         schema:
 *           type: string
 *         description: Filter by insurer slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /api/v1/products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product details by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/products/categories:
 *   get:
 *     tags: [Products]
 *     summary: List active categories (public)
 *     responses:
 *       200:
 *         description: Category list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /api/v1/products/insurers:
 *   get:
 *     tags: [Products]
 *     summary: List active insurers (public)
 *     responses:
 *       200:
 *         description: Insurer list
 */
