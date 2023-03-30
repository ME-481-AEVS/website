const express = require('express');
const { check, validationResult } = require('express-validator');
const Delivery = require('../models/delivery');

const router = express.Router();

// access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

// request new delivery
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('delivery_new', { title: ' | Schedule New Delivery', profileImgUrl: req.user.displayPhoto });
});

router.post('/new', ensureAuthenticated, [
  check('deliveryDate', 'Date is required').notEmpty(),
  check('deliveryTime', 'Time is required').notEmpty(),
], (req, res) => {
  // get errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('error');
    res.render('delivery_new', {
      title: ' | Schedule New Delivery',
      profileImgUrl: req.user.displayPhoto,
      errors,
    });
  } else {
    const delivery = new Delivery();
    delivery.status = 1;
    delivery.startLocation = req.body.deliveryPickup;
    delivery.endLocation = req.body.deliveryDestination;
    delivery.startTime = new Date(); // TODO parse from cal string
    delivery.endTime = delivery.startTime;
    delivery.endTime.setHours(delivery.endTime.getHours() + 1);
    delivery.user_id = req.user.id;

    try {
      delivery.save();
      console.log('Delivery scheduled.');
      req.flash('success', 'Delivery scheduled!');
      res.redirect('/user/home');
    } catch (err) {
      console.log(err);
    }
  }
});

// view scheduled deliveries
router.get('/scheduled', ensureAuthenticated, (req, res) => {
  res.render('delivery_scheduled', { title: ' | View Scheduled Deliveries', profileImgUrl: req.user.displayPhoto });
});

// view delivery history
router.get('/history', ensureAuthenticated, (req, res) => {
  res.render('delivery_history', { title: ' | View Scheduled Deliveries', profileImgUrl: req.user.displayPhoto });
});

module.exports = router;
