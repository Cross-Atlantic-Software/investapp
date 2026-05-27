export const Roles = {
  ADMIN: 1,
  SUPER_ADMIN: 2,
  BLOGGER: 3,
  SITE_MANAGER: 4,
} as const;

export const UserRole = {
  // Frontend Users
  RetailInvestor : 1,
  HNIs_UHNIs : 2,
  NRI : 3,
  InstitutionalInvestor : 4,
  Intermediary_Broker : 5,

  // Backend CMS Users
  Admin : 10,
  SuperAdmin : 11,
  Blogger : 12,
  SiteManager : 13,
}