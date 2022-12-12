const express = require("express");
const router = express.Router();

const {
    getProducts,
    getTop5Products,
    newProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview,
    getUserProducts,
} = require('../controllers/productController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route("/products/top5").get(getTop5Products);
router.route('/products/by-user').get(isAuthenticatedUser, authorizeRoles('admin', 'user'), getUserProducts);
router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);

router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin', 'user'), newProduct);

router.route('/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin', 'user'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'user'), deleteProduct);


router.route('/review').put(isAuthenticatedUser, createProductReview)
router.route('/reviews').get(isAuthenticatedUser, getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)

module.exports = router;
