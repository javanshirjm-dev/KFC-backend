// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    // Ensure Public role can create orders. This helps when deploying schema changes
    try {
      const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } })
      if (!role) {
        strapi.log.info('Public role not found; skipping order permission setup')
        return
      }

      const action = 'api::order.order.create'

      const existing = await strapi.query('plugin::users-permissions.permission').findOne({ where: { action, role: role.id } })
      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: role.id,
            enabled: true,
            // no policy, allow direct create
            policy: ''
          }
        })
        strapi.log.info('Enabled public create permission for orders')
      } else if (!existing.enabled) {
        await strapi.query('plugin::users-permissions.permission').update({ where: { id: existing.id }, data: { enabled: true } })
        strapi.log.info('Updated public permission to enabled for orders')
      } else {
        strapi.log.info('Public create permission for orders already enabled')
      }
    } catch (err) {
      strapi.log.error('Failed to ensure order permissions:', err)
    }
  },
};
