'use strict';

/**
 * Migration to set default status for orders that have null status
 */
module.exports = {
  async up(knex) {
    // Update any orders with null status to 'pending'
    await knex('orders').whereNull('status').update({ status: 'pending' });
  },

  async down(knex) {
    // Rollback: set status back to null (optional)
    await knex('orders').where({ status: 'pending' }).update({ status: null });
  }
};
