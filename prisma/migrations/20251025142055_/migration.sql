-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('GOD', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "note" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "name" "RoleName" NOT NULL,
    "label" TEXT,
    "rank" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "RoleToUser" (
    "id" SERIAL NOT NULL,
    "roleName" "RoleName" NOT NULL,
    "userId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleToUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionConfig" (
    "id" SERIAL NOT NULL,
    "roleName" "RoleName" NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "PermissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiddenComponentConfig" (
    "id" SERIAL NOT NULL,
    "roleName" "RoleName" NOT NULL,
    "context" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiddenComponentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "subscriptionExpiresAt" TIMESTAMP(3) NOT NULL,
    "numberOfParticipants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "movieName" TEXT NOT NULL,
    "isValid" BOOLEAN DEFAULT false,
    "categoryName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RoleToUser_roleName_userId_key" ON "RoleToUser"("roleName", "userId");

-- CreateIndex
CREATE INDEX "PermissionConfig_action_entity_scope_idx" ON "PermissionConfig"("action", "entity", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionConfig_action_entity_scope_roleName_key" ON "PermissionConfig"("action", "entity", "scope", "roleName");

-- CreateIndex
CREATE INDEX "HiddenComponentConfig_context_section_component_idx" ON "HiddenComponentConfig"("context", "section", "component");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenComponentConfig_context_section_component_roleName_key" ON "HiddenComponentConfig"("context", "section", "component", "roleName");

-- AddForeignKey
ALTER TABLE "RoleToUser" ADD CONSTRAINT "RoleToUser_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleToUser" ADD CONSTRAINT "RoleToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionConfig" ADD CONSTRAINT "PermissionConfig_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenComponentConfig" ADD CONSTRAINT "HiddenComponentConfig_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "Category"("name") ON DELETE SET NULL ON UPDATE CASCADE;
