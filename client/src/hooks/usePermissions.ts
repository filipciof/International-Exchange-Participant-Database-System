import { useSyncExternalStore } from "react";

let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return localStorage.getItem("activeGroup") || "";
}

export function setActiveGroup(group: string) {
  localStorage.setItem("activeGroup", group);
  listeners.forEach((l) => l());
}

type Permissions = {
  group: string;
  canViewSidebar: boolean;
  canViewStudents: boolean;
  canViewStaff: boolean;
  canViewClubs: boolean;
  canViewFamilies: boolean;
  canViewContacts: boolean;
  canEditExchanges: boolean;
  canAddDocuments: boolean;
  canEditDocuments: boolean;
  canToggleIsInbound: boolean;
  defaultIsInbound: boolean;
  canAssignGroups: boolean;
  canViewDistricts: boolean;
  canCreateHomeCountryClubs: boolean;
  canCreateHomeCountryDistricts: boolean;
  hasLockedSendingClub: boolean;
  canEditStaffClubInfo: boolean;
  canEditStudentName: boolean;
  canEditStudent: boolean;
  canDeleteStudent: boolean;
  canEditStaffName: boolean;
  hasLockedFamilyClubFilter: boolean;
  canSetCurrentYear: boolean;
  canResetStudentPasswords: boolean;
  canResetStaffPasswords: boolean;
};

function resolvePermissions(group: string): Permissions {
  switch (group) {
    case "admin":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: true,
        canViewClubs: true,
        canViewDistricts: true,
        canViewFamilies: true,
        canViewContacts: true,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: true,
        defaultIsInbound: true,
        canAssignGroups: true,
        canCreateHomeCountryClubs: true,
        canCreateHomeCountryDistricts: true,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: true,
        canEditStudentName: true,
        canEditStudent: true,
        canDeleteStudent: true,
        canEditStaffName: true,
        hasLockedFamilyClubFilter: false,
        canSetCurrentYear: true,
        canResetStudentPasswords: true,
        canResetStaffPasswords: true,
      };

    case "correspondent":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: false,
        canViewClubs: true,
        canViewDistricts: true,
        canViewFamilies: true,
        canViewContacts: true,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: false,
        defaultIsInbound: true,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        canCreateHomeCountryDistricts: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canEditStaffName: false,
        hasLockedFamilyClubFilter: false,
        canSetCurrentYear: false,
        canResetStudentPasswords: false,
        canResetStaffPasswords: false,
      };

    case "kwm_officer":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: false,
        canViewClubs: true,
        canViewDistricts: true,
        canViewFamilies: true,
        canViewContacts: true,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: false,
        defaultIsInbound: true,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        canCreateHomeCountryDistricts: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canEditStaffName: false,
        hasLockedFamilyClubFilter: false,
        canSetCurrentYear: false,
        canResetStudentPasswords: false,
        canResetStaffPasswords: false,
      };

    case "club_officer":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: false,
        canViewClubs: false,
        canViewDistricts: false,
        canViewFamilies: true,
        canViewContacts: false,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: false,
        defaultIsInbound: false,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        canCreateHomeCountryDistricts: false,
        hasLockedSendingClub: true,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canEditStaffName: false,
        hasLockedFamilyClubFilter: true,
        canSetCurrentYear: false,
        canResetStudentPasswords: false,
        canResetStaffPasswords: false,
      };

    case "student":
      return {
        group,
        canViewSidebar: false,
        canViewStudents: false,
        canViewStaff: false,
        canViewClubs: false,
        canViewDistricts: false,
        canViewFamilies: false,
        canViewContacts: false,
        canEditExchanges: false,
        canAddDocuments: true,
        canEditDocuments: false,
        canToggleIsInbound: false,
        defaultIsInbound: false,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        canCreateHomeCountryDistricts: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canEditStaffName: false,
        hasLockedFamilyClubFilter: false,
        canSetCurrentYear: false,
        canResetStudentPasswords: false,
        canResetStaffPasswords: false,
      };

    default:
      return {
        group,
        canViewSidebar: false,
        canViewStudents: false,
        canViewStaff: false,
        canViewClubs: false,
        canViewDistricts: false,
        canViewFamilies: false,
        canViewContacts: false,
        canEditExchanges: false,
        canAddDocuments: false,
        canEditDocuments: false,
        canToggleIsInbound: false,
        defaultIsInbound: false,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        canCreateHomeCountryDistricts: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canEditStaffName: false,
        hasLockedFamilyClubFilter: false,
        canSetCurrentYear: false,
        canResetStudentPasswords: false,
        canResetStaffPasswords: false,
      };
  }
}

export default function usePermissions(): Permissions {
  const group = useSyncExternalStore(subscribe, getSnapshot);

  return resolvePermissions(group);
}
