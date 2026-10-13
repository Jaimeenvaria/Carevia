const express = require('express');
const router = express.Router();
const { searchDoctors, getDoctorById, getSpecialties, getCities } = require('../controllers/searchController');

router.get('/', searchDoctors);
router.get('/specialties', getSpecialties);
router.get('/cities', getCities);
router.get('/:id', getDoctorById);

module.exports = router;
