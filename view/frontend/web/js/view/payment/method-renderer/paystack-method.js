/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*browser:true*/
/*global define*/
define(
    [
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/action/place-order',
        'Magento_Checkout/js/model/payment/additional-validators',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/full-screen-loader',
        'Magento_Checkout/js/action/redirect-on-success'
    ],
    function ($, Component, placeOrderAction, additionalValidators, quote, fullScreenLoader, redirectOnSuccessAction) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'Mattobell_Paystack/payment/paystack'
            },
            redirectAfterPlaceOrder : true,

            initialize: function () {
                this._super();
                $('head').append('<script src="https://js.paystack.co/v1/inline.js">');
                return this;
            },

            /** Returns send check to info */
            getMailingAddress: function() {
                return window.checkoutConfig.payment.checkmo.mailingAddress;
            },

            getCode: function () {
                return 'paystack';
            },

            placeOrder: function () {
                var self = this;
                //Retrieve custormer data
                  var checkoutConfig = window.checkoutConfig;
                  if (checkoutConfig.isCustomerLoggedIn) {
                      var custormer = checkoutConfig.customerData;
                      var email     = custormer.email;
                  } else {
                      //Retrieve guest email address.
                      var cache = JSON.parse(localStorage.getItem('mage-cache-storage'))['checkout-data'];
                      email = cache.validatedEmailValue;
                  }
                  //Total amount being converted to kobo.
                  var totalPrice   = Math.ceil(quote.totals().grand_total * 100);
                  var firstname    = quote.billingAddress().firstname;
                  var lastname     = quote.billingAddress().lastname;
                  var phone        = quote.billingAddress().telephone;
                  var name         = firstname+ ' '+lastname;
                  //Ajax call here to fetch nonce.
                  var references = [];
                  $.ajax({
                      "url": "/paystack/index",
                      "type": "GET",
                      "async": false,
                      "success": function(response){
                           references.push(response.nonce);
                      }
                  });
                var ref_key = references[0];
                var public_key = window.checkoutConfig.payment.paystack.paystack_key;
                var payload = {"email":email, "price": totalPrice, "name":name, "phone":phone, "nonce": ref_key, "public_key":public_key};
                //console.log(payload);
                self.payWithPaystack(payload);

                //var cache = JSON.parse(localStorae.getItem('mage-cache-storage'))['checkout-data'];
            },
            // paystack
            payWithPaystack: function(payload){
                var self = this;
                var handler = PaystackPop.setup({
                    key: payload.public_key,
                    email: payload.email,
                    amount: payload.price,
                    ref: payload.nonce,
                    metadata: {
                        custom_fields: [
                            {
                                display_name: payload.name,
                                variable_name: "mobile_number",
                                value: payload.phone
                            }
                        ]
                    },
                    callback: function(response){
                        //alert('success. transaction ref is ' + response.reference);
                        self.processPayment();
                    },
                    onClose: function(){
                        //alert('window closed');
                    }
                });
                handler.openIframe();
            },

            processPayment: function () {
                var self = this, placeOrder;

                if (this.validate() && additionalValidators.validate()) {
                    this.isPlaceOrderActionAllowed(false);
                    //placeOrder = placeOrderAction(this.getData(), this.redirectAfterPlaceOrder, this.messageContainer);
                    placeOrder = placeOrderAction(this.getData(), this.messageContainer);
                    $.when(placeOrder).fail(function () {
                        self.isPlaceOrderActionAllowed(true);
                    }).done(
                        function () {
                            self.afterPlaceOrder();

                            if (self.redirectAfterPlaceOrder) {
                                redirectOnSuccessAction.execute();
                            }
                        }
                    );

                    return true;
                }


                return false;
            },



        });
    }
);
