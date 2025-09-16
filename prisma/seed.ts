import { Permission, PermissionAction, PermissionModule, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'admin' },
      update: { name: 'admin' },
      create: { name: 'admin' }
    }),
    prisma.role.upsert({
      where: { name: 'user' },
      update: { name: 'user' },
      create: { name: 'user' }
    }),
    prisma.role.upsert({
      where: { name: 'moderator' },
      update: { name: 'moderator' },
      create: { name: 'moderator' }
    }),
    prisma.role.upsert({
      where: { name: 'developer' },
      update: { name: 'developer' },
      create: { name: 'developer' }
    })
  ])

  // Create permissions for all modules and actions
  const modules: PermissionModule[] = ['user', 'role', 'permission', 'role_user', 'role_permission']
  const actions: PermissionAction[] = ['create', 'read', 'update', 'delete']

  const permissions: Permission[] = []
  for (const module of modules) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: { action_module: { action, module } },
        update: { action, module },
        create: { action, module }
      })
      permissions.push(permission)
    }
  }

  // Define role permissions
  const rolePermissions = {
    admin: permissions.map((p) => ({ permission_id: p.id, can_do_the_action: true })),
    moderator: permissions
      .filter(
        (p) =>
          (p.module === 'user' && ['read', 'update'].includes(p.action)) ||
          (p.module === 'role' && p.action === 'read') ||
          (p.module === 'permission' && p.action === 'read')
      )
      .map((p) => ({ permission_id: p.id, can_do_the_action: true })),
    developer: permissions
      .filter(
        (p) =>
          (p.module === 'user' && p.action === 'read') ||
          (p.module === 'role' && p.action === 'read') ||
          (p.module === 'permission' && p.action === 'read')
      )
      .map((p) => ({ permission_id: p.id, can_do_the_action: true })),
    user: permissions
      .filter((p) => p.module === 'user' && p.action === 'read')
      .map((p) => ({ permission_id: p.id, can_do_the_action: true }))
  }

  // Assign permissions to roles
  for (const [roleName, rolePerms] of Object.entries(rolePermissions)) {
    const role = roles.find((r) => r.name === roleName)
    if (role) {
      for (const { permission_id, can_do_the_action } of rolePerms) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              permission_id,
              role_id: role.id
            }
          },
          update: { can_do_the_action },
          create: {
            can_do_the_action,
            permission_id,
            role_id: role.id
          }
        })
      }
    }
  }

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
